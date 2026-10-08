from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
import os; os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"
import json
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
import datetime

import models
from database import get_db
import auth, auth_router

router = APIRouter(prefix="/api/calendar", tags=["calendar"])

# Google API Scopes
SCOPES = ['https://www.googleapis.com/auth/calendar']
REDIRECT_URI = "http://127.0.0.1:8000/api/calendar/callback"

def get_google_flow():
    client_id = os.getenv("GOOGLE_CLIENT_ID")
    client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
    
    if not client_id or not client_secret:
        raise HTTPException(status_code=500, detail="Google Client ID or Secret missing in .env")

    client_config = {
        "web": {
            "client_id": client_id,
            "project_id": "sarvam-swarm",
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_secret": client_secret,
            "redirect_uris": [REDIRECT_URI]
        }
    }

    flow = Flow.from_client_config(
        client_config,
        scopes=SCOPES,
        redirect_uri=REDIRECT_URI
    )
    return flow

@router.get("/auth-url")
def get_auth_url(current_user: models.User = Depends(auth_router.get_current_user)):
    flow = get_google_flow()
    # Pass user.id in state so callback knows who authenticated
    authorization_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true',
        prompt='consent',
        state=str(current_user.id)
    )
    return {"url": authorization_url}

@router.get("/callback")
def google_callback(state: str, code: str, request: Request, db: Session = Depends(get_db)):
    flow = get_google_flow()
    
    # Reconstruct the full URL to fetch the token
    # FastAPI might strip the query string in flow.fetch_token if we don't pass the exact URL
    flow.fetch_token(authorization_response=str(request.url))
    
    credentials = flow.credentials
    
    # The state variable holds the user_id we passed
    user_id = int(state)
    user = db.query(models.User).filter(models.User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Save the refresh token to the database
    token_data = {
        'token': credentials.token,
        'refresh_token': credentials.refresh_token,
        'token_uri': credentials.token_uri,
        'client_id': credentials.client_id,
        'client_secret': credentials.client_secret,
        'scopes': credentials.scopes
    }
    user.google_token = json.dumps(token_data)
    db.commit()
    
    # Redirect back to the frontend dashboard
    return RedirectResponse("http://localhost:5173/?calendar_connected=true")

@router.get("/events")
def get_events(current_user: models.User = Depends(auth_router.get_current_user), db: Session = Depends(get_db)):
    if not current_user.google_token:
        raise HTTPException(status_code=400, detail="Google Calendar not connected")
        
    creds_data = json.loads(current_user.google_token)
    creds = Credentials.from_authorized_user_info(creds_data, SCOPES)
    
    # If token expired and we have a refresh token, it will refresh automatically during the request
    service = build('calendar', 'v3', credentials=creds)
    
    # Call the Calendar API
    now = datetime.datetime.utcnow().isoformat() + 'Z'  # 'Z' indicates UTC time
    events_result = service.events().list(
        calendarId='primary', timeMin=now,
        maxResults=10, singleEvents=True,
        orderBy='startTime'
    ).execute()
    
    events = events_result.get('items', [])
    return {"events": events}
