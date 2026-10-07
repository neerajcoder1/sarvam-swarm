import React, { useRef } from 'react';
import { AnimatedBeam } from './AnimatedBeam';
import SwarmLogo from './SwarmLogo';
import { Mail, Calendar, MessageCircle, FileText, Cloud, Database } from 'lucide-react';

export default function SwarmCapabilities() {
  const containerRef = useRef(null);
  const div1Ref = useRef(null);
  const div2Ref = useRef(null);
  const div3Ref = useRef(null);
  const div4Ref = useRef(null);
  const div5Ref = useRef(null);
  const div6Ref = useRef(null);
  const div7Ref = useRef(null);

  const beamProps = {
    curvature: 75,
    pathColor: "var(--line)",
    pathWidth: 2,
    pathOpacity: 0.3,
    gradientStartColor: "var(--accent)", // using the blue/indigo accent variable
    gradientStopColor: "#c084fc", // purple-400
    duration: 3,
  };

  return (
    <div
      ref={containerRef}
      className="relative flex h-[350px] w-full items-center justify-center overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-10 md:shadow-xl mt-12 mb-8"
    >
      <div className="flex size-full max-h-[250px] max-w-2xl flex-col items-stretch justify-between gap-10">
        <div className="flex flex-row items-center justify-between">
          <div
            ref={div1Ref}
            className="z-10 flex size-14 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface-hover)] shadow-lg"
          >
            <Cloud className="text-[var(--text-muted)]" size={24} />
          </div>
          <div
            ref={div5Ref}
            className="z-10 flex size-14 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface-hover)] shadow-lg"
          >
            <Database className="text-[var(--text-muted)]" size={24} />
          </div>
        </div>
        
        <div className="flex flex-row items-center justify-between">
          <div
            ref={div2Ref}
            className="z-10 flex size-14 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface-hover)] shadow-lg"
          >
            <FileText className="text-[var(--text-muted)]" size={24} />
          </div>
          <div
            ref={div4Ref}
            className="z-10 flex size-20 items-center justify-center rounded-2xl border border-[var(--line)] bg-[var(--surface-hover)] shadow-[0_0_20px_-5px_rgba(99,102,241,0.4)]"
          >
            <SwarmLogo size={36} className="text-[var(--accent)]" />
          </div>
          <div
            ref={div6Ref}
            className="z-10 flex size-14 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface-hover)] shadow-lg"
          >
            <Mail className="text-[var(--text-muted)]" size={24} />
          </div>
        </div>

        <div className="flex flex-row items-center justify-between">
          <div
            ref={div3Ref}
            className="z-10 flex size-14 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface-hover)] shadow-lg"
          >
            <MessageCircle className="text-[var(--text-muted)]" size={24} />
          </div>
          <div
            ref={div7Ref}
            className="z-10 flex size-14 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface-hover)] shadow-lg"
          >
            <Calendar className="text-[var(--text-muted)]" size={24} />
          </div>
        </div>
      </div>

      {/* Beams */}
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div1Ref}
        toRef={div4Ref}
        curvature={-75}
        endYOffset={-10}
        {...beamProps}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div2Ref}
        toRef={div4Ref}
        curvature={0}
        {...beamProps}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div3Ref}
        toRef={div4Ref}
        curvature={75}
        endYOffset={10}
        {...beamProps}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div5Ref}
        toRef={div4Ref}
        curvature={-75}
        endYOffset={-10}
        reverse
        {...beamProps}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div6Ref}
        toRef={div4Ref}
        curvature={0}
        reverse
        {...beamProps}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div7Ref}
        toRef={div4Ref}
        curvature={75}
        endYOffset={10}
        reverse
        {...beamProps}
      />
    </div>
  );
}
