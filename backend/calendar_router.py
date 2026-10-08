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
REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "http://127.0.0.1:8000/api/calendar/callback")

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
    client_id = os.getenv("GOOGLE_CLIENT_ID")
    
    # Generate the OAuth URL manually to completely avoid the PKCE bug in google's library
    import urllib.parse
    
    params = {
        "client_id": client_id,
        "redirect_uri": REDIRECT_URI,
        "response_type": "code",
        "scope": "https://www.googleapis.com/auth/calendar",
        "access_type": "offline",
        "prompt": "consent",
        "state": str(current_user.id)
    }
    
    authorization_url = "https://accounts.google.com/o/oauth2/v2/auth?" + urllib.parse.urlencode(params)
    
    return {"url": authorization_url}

@router.get("/callback")
def google_callback(state: str, code: str, request: Request, db: Session = Depends(get_db)):
    import requests
    client_id = os.getenv("GOOGLE_CLIENT_ID")
    client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
    
    # Exchange code for token manually to avoid PKCE missing state error
    data = {
        "client_id": client_id,
        "client_secret": client_secret,
        "code": code,
        "grant_type": "authorization_code",
        "redirect_uri": REDIRECT_URI
    }
    r = requests.post("https://oauth2.googleapis.com/token", data=data)
    if not r.ok:
        raise HTTPException(status_code=400, detail=f"Failed to get token: {r.text}")
    
    token_response = r.json()
    
    user_id = int(state)
    user = db.query(models.User).filter(models.User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    token_data = {
        'token': token_response.get('access_token'),
        'refresh_token': token_response.get('refresh_token'),
        'token_uri': "https://oauth2.googleapis.com/token",
        'client_id': client_id,
        'client_secret': client_secret,
        'scopes': SCOPES
    }
    
    # If the user already had a refresh token, preserve it if Google didn't send a new one
    if not token_data['refresh_token'] and user.google_token:
        try:
            old_data = json.loads(user.google_token)
            token_data['refresh_token'] = old_data.get('refresh_token')
        except:
            pass
            
    user.google_token = json.dumps(token_data)
    db.commit()
    
    return RedirectResponse(os.getenv("FRONTEND_URL", "http://localhost:5173") + "/?calendar_connected=true")

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


@router.post("/events/sync")
def sync_events(tasks: list[dict], current_user: models.User = Depends(auth_router.get_current_user), db: Session = Depends(get_db)):
    if not current_user.google_token:
        raise HTTPException(status_code=400, detail="Google Calendar not connected")
        
    creds_data = json.loads(current_user.google_token)
    creds = Credentials.from_authorized_user_info(creds_data, SCOPES)
    service = build('calendar', 'v3', credentials=creds)
    
    created_events = []
    
    import datetime
    
    # Get today's date in YYYY-MM-DD format
    today = datetime.datetime.now().strftime("%Y-%m-%d")
    
    for task in tasks:
        # We need to parse the time (e.g., '10:00 AM') into an ISO format for today
        time_str = task.get("time", "")
        if not time_str:
            continue
            
        try:
            # Parse '10:00 AM'
            time_obj = datetime.datetime.strptime(time_str, "%I:%M %p").time()
            
            # Combine today's date and the parsed time
            start_dt = datetime.datetime.combine(datetime.date.today(), time_obj)
            
            # Assume 1 hour duration by default if not specified
            end_dt = start_dt + datetime.timedelta(hours=1)
            
            event = {
                'summary': task.get("title", "Swarm Task"),
                'description': task.get("description", ""),
                'start': {
                    'dateTime': start_dt.isoformat(),
                    'timeZone': 'UTC', # Should use user's timezone if possible, default to UTC for now
                },
                'end': {
                    'dateTime': end_dt.isoformat(),
                    'timeZone': 'UTC',
                },
            }
            
            event_result = service.events().insert(calendarId='primary', body=event).execute()
            created_events.append(event_result.get('htmlLink'))
            
        except Exception as e:
            print(f"Failed to sync task: {e}")
            continue
            
    return {"message": f"Successfully synced {len(created_events)} events!", "links": created_events}
