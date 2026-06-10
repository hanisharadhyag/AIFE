/**
 * NEO-VAR // SYSTEM PROTOCOL ENGINE
 * Pure Vanilla JavaScript implementation of a Next-Gen officiating simulator.
 */

// --- INCIDENT DATA & SIMULATION GEOMETRY ---
const INCIDENTS = [
  {
    name: "Tight Offside Check",
    competition: "Premier League // Manchester Derby",
    fixture: "Manchester United vs Arsenal",
    time: "87:14",
    ruleTitle: "Law 11 - Offside",
    ruleRef: "https://www.theifab.com/laws/latest/offside/",
    ruleDescription: "A player is in an offside position if any part of their head, torso, or feet is in the opponents' half (excluding the halfway line) and is nearer to the opponents' goal line than both the ball and the second-last opponent at the moment the ball is played.",
    decision: "OFFSIDE",
    confidence: 99.8,
    escalation: "AUTO-RESOLVED",
    reasoning: [
      "IMU Ball sensor: Kick frame detected (Frame 35).",
      "Skeletal mesh initialized for 22 players.",
      "Calibrating 3D plane at defender's rearmost contact point (left heel: 21.82m).",
      "Attacker leading scoring contact point analyzed (right shoulder: 21.86m).",
      "Offside margin calculated: +4.2 cm (Tolerance threshold ±0.2 cm).",
      "Law 11.2 applied: Attacker active in play."
    ],
    consistency: [
      { fixture: "MCI vs NEW", date: "2026-05-12", metric: "+3.1cm Offside", similarity: "98.2%", ruling: "OFFSIDE", safe: false },
      { fixture: "LIV vs CHE", date: "2026-04-18", metric: "+5.8cm Offside", similarity: "96.5%", ruling: "OFFSIDE", safe: false }
    ],
    framesCount: 80,
    kickFrame: 35,
    setup: function(ctx1, ctx2, ctx3, ctx4, frame, options) {
      const w = 400, h = 250;
      
      // CAM 1: Tactical View
      drawPitchGrid(ctx1, w, h);
      // Draw defender line (blue) and attacker run (red)
      const defX = 220 - frame * 0.5;
      const attX = 205 + frame * 0.9;
      
      // Draw players
      drawPlayerNode(ctx1, defX, 100, "DEF 4", "blue", options.showAI);
      drawPlayerNode(ctx1, attX, 130, "ATT 7", "red", options.showAI);
      
      // Draw teammates / context players
      drawPlayerNode(ctx1, 120, 150, "ATT 10 (Kicker)", "red", false);
      drawPlayerNode(ctx1, 180, 50, "DEF 2", "blue", false);
      
      // Draw ball
      let ballX, ballY;
      if (frame < 35) {
        ballX = 125 + frame * 1.5;
        ballY = 145 - frame * 0.5;
      } else {
        ballX = 177.5 + (frame - 35) * 3;
        ballY = 127.5 + (frame - 35) * 0.1;
      }
      drawBall(ctx1, ballX, ballY);

      if (options.showAI && frame >= 35) {
        // Highlight offside line
        ctx1.strokeStyle = "rgba(0, 217, 255, 0.4)";
        ctx1.lineWidth = 2;
        ctx1.beginPath();
        ctx1.moveTo(220 - 35 * 0.5, 20);
        ctx1.lineTo(220 - 35 * 0.5, h - 20);
        ctx1.stroke();
      }

      // CAM 2: Player Skeletal Tracking (Close up tracking)
      drawHighTechGrid(ctx2, w, h);
      // Zoom into the attacker & defender
      const cam2AttX = 130 + (frame - 35) * 4;
      const cam2DefX = 180 - (frame - 35) * 2;
      
      // Skeletal render
      drawSkeleton(ctx2, cam2DefX, 120, 1.2, "blue", "DEF 4 (0.8m/s)", frame === 35 && options.showAI);
      drawSkeleton(ctx2, cam2AttX, 115, 1.25, "red", "ATT 7 (8.2m/s)", frame === 35 && options.showAI);

      // CAM 3: Hawk-Eye 3D Offside Calibration
      drawHighTechGrid(ctx3, w, h);
      
      // Drawing orthographic vertical line overlay at the exact kick frame
      // Frame 35 is the release point
      const staticDefX = 220; // calibrated defender coordinate
      const staticAttX = 232; // calibrated attacker coordinate
      
      // Draw 3D field perspective lines
      ctx3.strokeStyle = "rgba(255,255,255,0.15)";
      ctx3.lineWidth = 1;
      for (let i = -4; i <= 4; i++) {
        ctx3.beginPath();
        ctx3.moveTo(w/2 + i * 50, h);
        ctx3.lineTo(w/2 + i * 20, 0);
        ctx3.stroke();
      }
      
      // Vertical Calibration lines
      if (frame >= 35) {
        // Draw 3D planes
        // Defender plane (Heel - Blue)
        ctx3.fillStyle = "rgba(0, 162, 255, 0.08)";
        ctx3.beginPath();
        ctx3.moveTo(staticDefX, 30);
        ctx3.lineTo(staticDefX + 30, h - 30);
        ctx3.lineTo(staticDefX + 28, h - 30);
        ctx3.lineTo(staticDefX - 2, 30);
        ctx3.closePath();
        ctx3.fill();
        
        ctx3.strokeStyle = "var(--neon-blue)";
        ctx3.lineWidth = 2;
        ctx3.beginPath();
        ctx3.moveTo(staticDefX, 30);
        ctx3.lineTo(staticDefX, h - 30);
        ctx3.stroke();
        
        // Attacker plane (Shoulder - Red)
        ctx3.fillStyle = "rgba(255, 51, 102, 0.08)";
        ctx3.beginPath();
        ctx3.moveTo(staticAttX, 28);
        ctx3.lineTo(staticAttX + 30, h - 28);
        ctx3.lineTo(staticAttX + 28, h - 28);
        ctx3.lineTo(staticAttX - 2, 28);
        ctx3.closePath();
        ctx3.fill();

        ctx3.strokeStyle = "var(--neon-red)";
        ctx3.lineWidth = 2;
        ctx3.beginPath();
        ctx3.moveTo(staticAttX, 28);
        ctx3.lineTo(staticAttX, h - 28);
        ctx3.stroke();

        if (options.showAI) {
          // Highlight points of measurement
          // Defender Left Heel
          ctx3.fillStyle = "var(--neon-blue)";
          ctx3.beginPath();
          ctx3.arc(staticDefX, 180, 5, 0, Math.PI * 2);
          ctx3.fill();
          ctx3.stroke();
          
          // Attacker Shoulder
          ctx3.fillStyle = "var(--neon-red)";
          ctx3.beginPath();
          ctx3.arc(staticAttX, 85, 5, 0, Math.PI * 2);
          ctx3.fill();
          ctx3.stroke();
          
          // Connect line with text
          ctx3.strokeStyle = "var(--neon-gold)";
          ctx3.lineWidth = 1.5;
          ctx3.setLineDash([3, 3]);
          ctx3.beginPath();
          ctx3.moveTo(staticDefX, 130);
          ctx3.lineTo(staticAttX, 130);
          ctx3.stroke();
          ctx3.setLineDash([]);
          
          ctx3.font = "bold 10px var(--font-mono)";
          ctx3.fillStyle = "var(--neon-gold)";
          ctx3.fillText("MARGIN: +4.2 cm", (staticDefX + staticAttX)/2 - 40, 122);
          
          // Decision Badge
          ctx3.fillStyle = "rgba(255, 51, 102, 0.9)";
          ctx3.fillRect(w/2 - 50, 20, 100, 22);
          ctx3.strokeStyle = "#fff";
          ctx3.lineWidth = 1;
          ctx3.strokeRect(w/2 - 50, 20, 100, 22);
          ctx3.font = "bold 11px var(--font-display)";
          ctx3.fillStyle = "#fff";
          ctx3.fillText("OFFSIDE DETECTED", w/2 - 45, 35);
        }
      } else {
        // Draw players in motion before kick
        drawPlayerDot(ctx3, staticDefX - 30 + frame * 0.8, 150, "blue");
        drawPlayerDot(ctx3, staticAttX - 45 + frame * 1.3, 145, "red");
      }

      // CAM 4: Ball Telemetry Sensor Waveform
      drawHighTechGrid(ctx4, w, h);
      ctx4.font = "10px var(--font-mono)";
      ctx4.fillStyle = "var(--text-muted)";
      ctx4.fillText("IMU 500Hz REAL-TIME ACCELEROMETRY", 15, 25);
      
      // Draw graph
      ctx4.strokeStyle = "rgba(59, 130, 246, 0.4)";
      ctx4.lineWidth = 1;
      ctx4.beginPath();
      ctx4.moveTo(30, 130);
      ctx4.lineTo(w - 20, 130);
      ctx4.stroke();
      
      // Generate sensor signal wave
      ctx4.strokeStyle = "var(--neon-blue)";
      ctx4.lineWidth = 2;
      ctx4.beginPath();
      for (let x = 30; x < w - 20; x++) {
        const t = (x - 30) / (w - 50); // normalized 0 to 1
        const fIndex = Math.floor(t * 80);
        let val = 0;
        
        // Spike at kick frame (35)
        if (fIndex === 35) {
          val = 70;
        } else if (fIndex > 35 && fIndex < 42) {
          val = Math.sin((fIndex - 35) * 1.5) * 35 / (fIndex - 34);
        } else {
          val = Math.sin(t * 50) * 2 + (Math.random() - 0.5) * 1.5;
        }
        
        const y = 130 - val;
        if (x === 30) ctx4.moveTo(x, y);
        else ctx4.lineTo(x, y);
      }
      ctx4.stroke();
      
      // Draw playhead vertical line on telemetry
      const playheadX = 30 + (frame / 80) * (w - 50);
      ctx4.strokeStyle = "var(--neon-gold)";
      ctx4.lineWidth = 1;
      ctx4.beginPath();
      ctx4.moveTo(playheadX, 40);
      ctx4.lineTo(playheadX, 210);
      ctx4.stroke();
      
      // Label spike point
      const kickX = 30 + (35 / 80) * (w - 50);
      ctx4.fillStyle = "var(--neon-gold)";
      ctx4.beginPath();
      ctx4.arc(kickX, 60, 4, 0, Math.PI * 2);
      ctx4.fill();
      
      ctx4.font = "9px var(--font-mono)";
      ctx4.fillStyle = "var(--neon-gold)";
      ctx4.fillText("IMPACT SPIKE (KICK FRAME 35)", kickX + 8, 63);
    }
  },
  {
    name: "Penalty Box Collision",
    competition: "La Liga // El Clásico",
    fixture: "Real Madrid vs FC Barcelona",
    time: "44:02",
    ruleTitle: "Law 12 - Fouls & Misconduct",
    ruleRef: "https://www.theifab.com/laws/latest/fouls-and-misconduct/",
    ruleDescription: "A penalty kick is awarded if a player commits any of the cautionable/sending-off offences inside their own penalty area, including tripping or attempting to trip an opponent in a careless, reckless, or using excessive force manner.",
    decision: "PENALTY",
    confidence: 87.0,
    escalation: "ESC_OFR", // Escalated to On-Field Review
    reasoning: [
      "Contact detected at Frame 52 between Defender foot and Attacker shin.",
      "Ball sensor analysis: Ball velocity remained unchanged during contact frame.",
      "Defender skeletal ankle joint load calculated: 2.1 kN (Significant force).",
      "Tripping action verified: Attacker's path blocked without playing the ball.",
      "Confidence index: 87.0% (Subjective force limit, human review mandatory)."
    ],
    consistency: [
      { fixture: "MCI vs CHE", date: "2026-03-10", metric: "No-ball contact trip", similarity: "94.8%", ruling: "PENALTY", safe: false },
      { fixture: "ATM vs RMA", date: "2026-02-28", metric: "Sliding contact trip", similarity: "91.2%", ruling: "PENALTY", safe: false }
    ],
    framesCount: 80,
    kickFrame: 52, // Frame of contact
    setup: function(ctx1, ctx2, ctx3, ctx4, frame, options) {
      const w = 400, h = 250;
      
      // CAM 1: Tactical Zoom
      drawPitchGrid(ctx1, w, h);
      
      // Draw penalty box area outline zoomed
      ctx1.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx1.strokeRect(-50, 40, w - 80, h - 80);
      
      // Position calculation
      const attX = 140 + frame * 0.8;
      const attY = 120 + frame * 0.2;
      let defX, defY;
      
      if (frame < 52) {
        defX = 280 - (frame) * 1.5;
        defY = 160 - (frame) * 0.5;
      } else {
        defX = 280 - 52 * 1.5 + (frame - 52) * 0.2;
        defY = 160 - 52 * 0.5 + (frame - 52) * 0.1;
      }
      
      // Players
      drawPlayerNode(ctx1, attX, attY, "Vini Jr. (ATT)", "white", false);
      drawPlayerNode(ctx1, defX, defY, "Araujo (DEF)", "blue", false);
      
      // Ball coordinates (moving forward)
      const ballX = 160 + frame * 1.1;
      const ballY = 110 + frame * 0.25;
      drawBall(ctx1, ballX, ballY);

      if (options.showAI && frame >= 52) {
        ctx1.strokeStyle = "var(--neon-red)";
        ctx1.beginPath();
        ctx1.arc(attX, attY, 15, 0, Math.PI * 2);
        ctx1.stroke();
        ctx1.font = "9px var(--font-mono)";
        ctx1.fillStyle = "var(--neon-red)";
        ctx1.fillText("CONTACT POINT", attX + 18, attY + 4);
      }

      // CAM 2: Skeletal Mesh Tracking
      drawHighTechGrid(ctx2, w, h);
      
      // Skeletal close-up zoom of slide tackle contact
      const zoomAttX = 160;
      const zoomAttY = 120;
      const zoomDefX = 160 + (52 - frame) * 2.5;
      const zoomDefY = 125;
      
      drawSkeleton(ctx2, zoomAttX, zoomAttY - 30, 1.3, "white", "ATT TRACKER", false);
      
      // Draw defender sliding skeleton
      ctx2.strokeStyle = "rgba(0, 162, 255, 0.6)";
      ctx2.lineWidth = 3;
      // Slide body silhouette
      ctx2.beginPath();
      // Hip
      ctx2.arc(zoomDefX - 40, zoomDefY + 30, 4, 0, Math.PI*2);
      // Spine to Head
      ctx2.moveTo(zoomDefX - 40, zoomDefY + 30);
      ctx2.lineTo(zoomDefX - 60, zoomDefY + 15);
      ctx2.arc(zoomDefX - 65, zoomDefY + 10, 6, 0, Math.PI*2); // head
      // Sliding leg extending towards attacker shin
      ctx2.moveTo(zoomDefX - 40, zoomDefY + 30);
      ctx2.lineTo(zoomDefX - 10, zoomDefY + 35); // Knee
      ctx2.lineTo(zoomDefX + 15, zoomDefY + 38); // Ankle
      ctx2.stroke();
      
      // Highlight collision joint
      if (frame >= 52) {
        ctx2.fillStyle = "var(--neon-red)";
        ctx2.beginPath();
        ctx2.arc(zoomDefX + 15, zoomDefY + 38, 6, 0, Math.PI * 2);
        ctx2.fill();
        ctx2.font = "9px var(--font-mono)";
        ctx2.fillStyle = "var(--neon-red)";
        ctx2.fillText("JOINT IMPACT DETECTED", zoomDefX + 25, zoomDefY + 42);
      }

      // CAM 3: Contact Force Telemetry Overlay
      drawHighTechGrid(ctx3, w, h);
      
      // Frame 52 contact zoom close-up
      ctx3.fillStyle = "#0c111c";
      ctx3.fillRect(20, 40, w - 40, h - 80);
      ctx3.strokeStyle = "var(--border-color)";
      ctx3.strokeRect(20, 40, w - 40, h - 80);
      
      // Draw grid zoom lines
      ctx3.strokeStyle = "rgba(59, 130, 246, 0.1)";
      for(let x=40; x < w-20; x+=20) {
        ctx3.beginPath(); ctx3.moveTo(x, 40); ctx3.lineTo(x, h-40); ctx3.stroke();
      }
      
      // Contact graphic
      const midX = w / 2;
      const midY = h / 2;
      
      // Attacker Leg (vertical cylinder representation)
      ctx3.fillStyle = "rgba(255, 255, 255, 0.25)";
      ctx3.fillRect(midX - 15, 50, 30, 120);
      
      // Sliding Boot (horizontal shoe shape sliding in from right)
      let bootX;
      if (frame < 52) {
        bootX = midX + 60 - (frame - 30) * 3;
      } else {
        bootX = midX - 8;
      }
      
      ctx3.fillStyle = "rgba(0, 162, 255, 0.5)";
      ctx3.beginPath();
      ctx3.moveTo(bootX, midY + 30);
      ctx3.lineTo(bootX + 50, midY + 20);
      ctx3.lineTo(bootX + 70, midY + 45);
      ctx3.lineTo(bootX, midY + 45);
      ctx3.closePath();
      ctx3.fill();
      
      if (frame >= 52) {
        // Exploding contact concentric circles
        const scale = 1 + (frame - 52) * 0.8;
        ctx3.strokeStyle = `rgba(255, 51, 102, ${1 - (frame - 52)/28})`;
        ctx3.lineWidth = 2;
        ctx3.beginPath();
        ctx3.arc(midX - 5, midY + 35, scale * 3, 0, Math.PI * 2);
        ctx3.stroke();
        
        ctx3.beginPath();
        ctx3.arc(midX - 5, midY + 35, scale * 6, 0, Math.PI * 2);
        ctx3.stroke();
        
        // Force meter
        ctx3.fillStyle = "var(--neon-red)";
        ctx3.fillRect(w - 70, 60, 12, 100);
        ctx3.fillStyle = "rgba(0,0,0,0.5)";
        ctx3.fillRect(w - 70, 60, 12, Math.max(0, 100 - (frame - 52) * 8));
        ctx3.strokeStyle = "#fff";
        ctx3.strokeRect(w - 70, 60, 12, 100);
        
        ctx3.font = "bold 9px var(--font-mono)";
        ctx3.fillStyle = "var(--neon-red)";
        ctx3.fillText("FORCE LOAD: 2.1 kN", midX - 55, midY - 10);
        ctx3.fillText("SKELETAL TRIP LEVEL: HIGH", midX - 70, midY + 5);
      }

      // CAM 4: Ball Telemetry (Velocity check)
      drawHighTechGrid(ctx4, w, h);
      ctx4.font = "10px var(--font-mono)";
      ctx4.fillStyle = "var(--text-muted)";
      ctx4.fillText("BALL ACCELERATION IMU GRAPH (TACKLE TIMELINE)", 15, 25);
      
      ctx4.strokeStyle = "rgba(255,255,255,0.1)";
      ctx4.beginPath();
      ctx4.moveTo(30, 130);
      ctx4.lineTo(w - 20, 130);
      ctx4.stroke();
      
      // Render ball telemetry.
      // Ball velocity should be flat/constant, meaning the defender DID NOT hit the ball at frame 52
      ctx4.strokeStyle = "var(--neon-green)";
      ctx4.lineWidth = 2;
      ctx4.beginPath();
      for (let x = 30; x < w - 20; x++) {
        const t = (x - 30) / (w - 50);
        const fIndex = Math.floor(t * 80);
        let val = 0;
        
        // No spike at frame 52. Small kick spikes elsewhere
        if (fIndex === 2) {
          val = 30; // initial pass
        } else {
          // slight vibration noise
          val = Math.sin(t * 120) * 0.8 + (Math.random() - 0.5) * 0.4;
        }
        
        const y = 130 - val;
        if (x === 30) ctx4.moveTo(x, y);
        else ctx4.lineTo(x, y);
      }
      ctx4.stroke();
      
      // Draw playhead vertical line
      const playheadX = 30 + (frame / 80) * (w - 50);
      ctx4.strokeStyle = "var(--neon-gold)";
      ctx4.lineWidth = 1;
      ctx4.beginPath();
      ctx4.moveTo(playheadX, 40);
      ctx4.lineTo(playheadX, 210);
      ctx4.stroke();
      
      // Explainer text on Cam 4
      ctx4.font = "9px var(--font-mono)";
      ctx4.fillStyle = "var(--neon-green)";
      ctx4.fillText("BALL SENSOR STATE: NO IMPACT AT F-52", 35, 180);
      ctx4.fillStyle = "var(--neon-red)";
      ctx4.fillText("DEFENDER MISSED BALL -> DIRECT TRIP", 35, 195);
    }
  },
  {
    name: "Goal-Line Technology",
    competition: "Bundesliga // Der Klassiker",
    fixture: "FC Bayern vs Borussia Dortmund",
    time: "81:54",
    ruleTitle: "Law 10 - Determining Outcome",
    ruleRef: "https://www.theifab.com/laws/latest/determining-the-outcome-of-a-match/",
    ruleDescription: "A goal is scored when the whole of the ball passes over the goal line, between the goalposts and under the crossbar, provided that no offence has been committed by the team scoring the goal.",
    decision: "NO GOAL",
    confidence: 100.0,
    escalation: "AUTO-RESOLVED",
    reasoning: [
      "Magnetic field tracking activated at goalposts.",
      "High-speed line cameras capturing at 2000fps.",
      "Ball physical edge computed via spherical telemetry.",
      "Maximum penetration point reached at Frame 44.",
      "Gap remaining: -1.2 cm (Ball did NOT fully cross line).",
      "Goal-Line Protocol: Automatic feedback sent to referee watch."
    ],
    consistency: [
      { fixture: "RMA vs ATM", date: "2026-05-02", metric: "-0.5cm Clearance", similarity: "99.9%", ruling: "NO GOAL", safe: true },
      { fixture: "BVB vs LEI", date: "2026-04-12", metric: "+0.3cm Goal bounce", similarity: "99.8%", ruling: "GOAL", safe: false }
    ],
    framesCount: 80,
    kickFrame: 44, // Max line crossing frame
    setup: function(ctx1, ctx2, ctx3, ctx4, frame, options) {
      const w = 400, h = 250;
      
      // CAM 1: Tactical View
      drawPitchGrid(ctx1, w, h);
      
      // Ball floats towards the right goal mouth
      const startX = 220;
      const targetX = 370;
      let ballX;
      
      if (frame < 44) {
        ballX = startX + (targetX - startX) * (frame / 44);
      } else {
        ballX = targetX - (frame - 44) * 4;
      }
      
      // Draw goalkeeper sliding back
      drawPlayerNode(ctx1, 355, 125, "Neuer (GK)", "red", false);
      drawBall(ctx1, ballX, 125);
      
      // Highlight goalposts on tactical view
      ctx1.strokeStyle = "#fff";
      ctx1.lineWidth = 3;
      ctx1.strokeRect(375, 100, 5, 50);

      // CAM 2: Skeletal Mesh View
      drawHighTechGrid(ctx2, w, h);
      // Zoomed wireframe of keeper extending arm back
      const gkX = 140;
      const gkY = 120;
      
      drawSkeleton(ctx2, gkX, gkY, 1.3, "red", "GK BACKTRACK", false);
      
      // Draw Goal net mesh behind keeper
      ctx2.strokeStyle = "rgba(255,255,255,0.06)";
      ctx2.lineWidth = 1;
      for (let gy = 40; gy < h - 40; gy += 15) {
        ctx2.beginPath(); ctx2.moveTo(250, gy); ctx2.lineTo(w - 20, gy); ctx2.stroke();
      }
      for (let gx = 250; gx < w - 20; gx += 15) {
        ctx2.beginPath(); ctx2.moveTo(gx, 40); ctx2.lineTo(gx, h - 40); ctx2.stroke();
      }

      // CAM 3: Goal-Line Zoom Camera
      drawHighTechGrid(ctx3, w, h);
      
      // Center representing goal-line
      // Draw vertical goal line (white)
      const lineX = w / 2 - 20;
      const lineWidth = 15;
      
      ctx3.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx3.fillRect(lineX, 20, lineWidth, h - 40);
      
      // Goal post cross section
      ctx3.fillStyle = "#fff";
      ctx3.fillRect(lineX, 0, lineWidth, 20);
      
      // Calculate ball positions on line zoom
      // Ball moves from left to right, reaching max penetration at frame 44
      let zoomBallX;
      const radius = 35;
      
      if (frame < 44) {
        // approach
        zoomBallX = 30 + (lineX + lineWidth - 15 - 30) * (frame / 44);
      } else {
        // rebound
        zoomBallX = (lineX + lineWidth - 15) - (frame - 44) * 6;
      }
      
      // Draw ball
      ctx3.fillStyle = "rgba(255, 255, 255, 0.95)";
      ctx3.beginPath();
      ctx3.arc(zoomBallX, h / 2, radius, 0, Math.PI * 2);
      ctx3.fill();
      
      // Goal plane indicator vertical line
      const planeX = lineX + lineWidth;
      ctx3.strokeStyle = "var(--neon-green)";
      ctx3.lineWidth = 1.5;
      ctx3.beginPath();
      ctx3.moveTo(planeX, 0);
      ctx3.lineTo(planeX, h);
      ctx3.stroke();
      
      if (options.showAI) {
        // Highlight gap
        const gap = planeX - (zoomBallX - radius); // gap from leftmost point of ball to rightmost edge of line
        
        ctx3.strokeStyle = "var(--neon-red)";
        ctx3.lineWidth = 2;
        ctx3.beginPath();
        ctx3.moveTo(zoomBallX - radius, h/2);
        ctx3.lineTo(planeX, h/2);
        ctx3.stroke();
        
        // Bounding boxes
        ctx3.strokeStyle = "rgba(0,217,255,0.5)";
        ctx3.strokeRect(zoomBallX - radius, h/2 - radius, radius * 2, radius * 2);
        
        ctx3.font = "bold 9px var(--font-mono)";
        if (frame >= 40 && frame <= 48) {
          ctx3.fillStyle = "var(--neon-red)";
          ctx3.fillText("GAP REMAINING: -1.2 cm", w / 2 + 10, h / 2 - 10);
          
          // Large HUD text
          ctx3.fillStyle = "rgba(255,51,102,0.85)";
          ctx3.fillRect(10, h - 35, w - 20, 20);
          ctx3.fillStyle = "#fff";
          ctx3.font = "bold 10px var(--font-display)";
          ctx3.fillText("GLT PROTOCOL: NO GOAL - UNQUALIFIED CROSSING", 20, h - 22);
        }
      }

      // CAM 4: Goal-Line Telemetry Render
      drawHighTechGrid(ctx4, w, h);
      ctx4.font = "10px var(--font-mono)";
      ctx4.fillStyle = "var(--text-muted)";
      ctx4.fillText("GLT MAGNETIC INDUCTION FEEDBACK (500Hz)", 15, 25);
      
      // Drawing a magnetic field wave around posts
      ctx4.strokeStyle = "rgba(0, 255, 136, 0.2)";
      ctx4.lineWidth = 1.5;
      for (let r = 20; r < 120; r += 20) {
        ctx4.beginPath();
        ctx4.arc(w - 20, h / 2, r, 0, Math.PI * 2);
        ctx4.stroke();
      }
      
      // Draw goal frame line
      ctx4.fillStyle = "#1e293b";
      ctx4.fillRect(w - 25, 30, 10, h - 60);
      
      // Induction sensor level display
      const signalStrength = frame >= 42 && frame <= 46 ? 98 : (frame > 25 && frame < 60 ? 40 : 5);
      
      ctx4.fillStyle = "rgba(0,0,0,0.5)";
      ctx4.fillRect(40, 70, 150, 80);
      ctx4.strokeStyle = "rgba(255,255,255,0.1)";
      ctx4.strokeRect(40, 70, 150, 80);
      
      ctx4.font = "9px var(--font-mono)";
      ctx4.fillStyle = "var(--text-muted)";
      ctx4.fillText("POST INDUCTION LOAD:", 45, 88);
      ctx4.fillStyle = signalStrength > 90 ? "var(--neon-red)" : "var(--neon-green)";
      ctx4.font = "bold 16px var(--font-display)";
      ctx4.fillText(`${signalStrength}%`, 45, 110);
      
      ctx4.font = "9px var(--font-mono)";
      ctx4.fillStyle = "var(--text-main)";
      ctx4.fillText("GLT STATUS: LOCKED", 45, 132);
      ctx4.fillText(`BALL OVERLAP: ${frame === 44 ? "94.6%" : "INCOMPLETE"}`, 45, 142);
    }
  },
  {
    name: "Silhouette Handball Check",
    competition: "Champions League // Group Stage",
    fixture: "Chelsea vs Liverpool",
    time: "32:10",
    ruleTitle: "Law 12 - Handball",
    ruleRef: "https://www.theifab.com/laws/latest/fouls-and-misconduct/#handball",
    ruleDescription: "It is an offence if a player touches the ball with their hand/arm when it has made their body unnaturally bigger. A player is considered to have made their body unnaturally bigger when the position of their hand/arm is not a consequence of, or justifiable by, the player’s body movement.",
    decision: "PENALTY (HANDBALL)",
    confidence: 96.5,
    escalation: "AUTO-RESOLVED",
    reasoning: [
      "Arm silhouette expansion measured at 84 degrees.",
      "Body area enlarged by 42% relative to anatomical baseline.",
      "High-speed impact spike detected on ball accelerometer at Frame 60.",
      "Distance traveled by ball before impact: 8.5m (Adequate reaction time).",
      "No deflection or touch by surrounding players before contact.",
      "Law 12.1 applied: Arm position not justifiable by physical movement."
    ],
    consistency: [
      { fixture: "ARS vs CHE", date: "2026-02-15", metric: "82° arm flare block", similarity: "95.1%", ruling: "PENALTY", safe: false },
      { fixture: "TOT vs WHU", date: "2025-12-05", metric: "45° arm tuck bounce", similarity: "91.8%", ruling: "NO HANDBALL", safe: true }
    ],
    framesCount: 80,
    kickFrame: 60, // Handball contact
    setup: function(ctx1, ctx2, ctx3, ctx4, frame, options) {
      const w = 400, h = 250;
      
      // CAM 1: Tactical View
      drawPitchGrid(ctx1, w, h);
      
      // Cross comes in from bottom-left corner
      const crossStartX = 80;
      const crossStartY = 200;
      const defenderX = 280;
      const defenderY = 110;
      
      let ballX, ballY;
      if (frame < 60) {
        ballX = crossStartX + (defenderX - crossStartX) * (frame / 60);
        ballY = crossStartY - (crossStartY - defenderY) * (frame / 60);
      } else {
        ballX = defenderX + (frame - 60) * 1.5;
        ballY = defenderY + (frame - 60) * 0.8;
      }
      
      drawPlayerNode(ctx1, defenderX, defenderY, "Thiago Silva (DEF)", "blue", false);
      drawPlayerNode(ctx1, 230, 90, "Salah (ATT)", "red", false);
      drawBall(ctx1, ballX, ballY);

      if (options.showAI && frame >= 60) {
        ctx1.strokeStyle = "var(--neon-red)";
        ctx1.strokeRect(defenderX - 15, defenderY - 25, 30, 45);
        ctx1.font = "8px var(--font-mono)";
        ctx1.fillStyle = "var(--neon-red)";
        ctx1.fillText("HANDBALL AREA", defenderX - 25, defenderY - 30);
      }

      // CAM 2: Skeletal Mesh View
      drawHighTechGrid(ctx2, w, h);
      
      // Draw standing defender skeletal frame showing arm flared outward
      const centerD_X = w / 2 - 30;
      const centerD_Y = h / 2 - 10;
      
      drawSkeleton(ctx2, centerD_X, centerD_Y - 40, 1.5, "blue", "SILVA (DEF)", false);
      
      // Draw extended arm manually to show flare
      ctx2.strokeStyle = "rgba(0, 162, 255, 0.8)";
      ctx2.lineWidth = 4;
      ctx2.beginPath();
      // Shoulder (from skeleton)
      ctx2.moveTo(centerD_X - 22, centerD_Y - 30);
      // Flared Arm (84 degrees outward)
      const armElbowX = centerD_X - 55;
      const armElbowY = centerD_Y - 20;
      const armHandX = centerD_X - 70;
      const armHandY = centerD_Y + 15;
      
      ctx2.lineTo(armElbowX, armElbowY);
      ctx2.lineTo(armHandX, armHandY);
      ctx2.stroke();
      
      // Bounding box of arm
      ctx2.strokeStyle = "rgba(255, 51, 102, 0.4)";
      ctx2.lineWidth = 1;
      ctx2.strokeRect(armHandX - 8, armHandY - 8, 16, 16);
      
      // Draw ball hit
      if (frame >= 60) {
        const ballF_X = armHandX + (frame - 60) * 1.5;
        const ballF_Y = armHandY + (frame - 60) * 1.0;
        ctx2.fillStyle = "#fff";
        ctx2.beginPath();
        ctx2.arc(ballF_X, ballF_Y, 8, 0, Math.PI * 2);
        ctx2.fill();
        
        ctx2.fillStyle = "rgba(255, 51, 102, 0.3)";
        ctx2.beginPath();
        ctx2.arc(armHandX, armHandY, 15, 0, Math.PI*2);
        ctx2.fill();
      }

      // CAM 3: Silhouette Calibration View
      drawHighTechGrid(ctx3, w, h);
      
      const silX = w / 2;
      const silY = h / 2 - 20;
      
      // Draw solid anatomical silhouette (blue)
      ctx3.fillStyle = "rgba(30, 41, 59, 0.9)";
      ctx3.fillRect(silX - 25, silY - 30, 50, 100); // core body
      ctx3.beginPath();
      ctx3.arc(silX, silY - 45, 15, 0, Math.PI * 2); // head
      ctx3.fill();
      
      // Extended hand silhouette flare
      ctx3.strokeStyle = "rgba(59, 130, 246, 0.5)";
      ctx3.lineWidth = 15;
      ctx3.lineCap = "round";
      ctx3.beginPath();
      ctx3.moveTo(silX - 20, silY - 25);
      ctx3.lineTo(silX - 60, silY - 10);
      ctx3.lineTo(silX - 70, silY + 20);
      ctx3.stroke();
      
      // Draw angle wedge
      ctx3.fillStyle = "rgba(255, 170, 0, 0.2)";
      ctx3.beginPath();
      ctx3.moveTo(silX - 20, silY - 25);
      ctx3.arc(silX - 20, silY - 25, 45, Math.PI, Math.PI * 1.46);
      ctx3.closePath();
      ctx3.fill();
      
      ctx3.strokeStyle = "var(--neon-gold)";
      ctx3.lineWidth = 1.5;
      ctx3.beginPath();
      ctx3.arc(silX - 20, silY - 25, 45, Math.PI, Math.PI * 1.46);
      ctx3.stroke();
      
      ctx3.font = "bold 10px var(--font-mono)";
      ctx3.fillStyle = "var(--neon-gold)";
      ctx3.fillText("FLARE: 84°", silX - 85, silY - 35);
      
      if (options.showAI) {
        ctx3.fillStyle = "rgba(255, 51, 102, 0.15)";
        ctx3.fillRect(silX - 85, silY - 15, 45, 50);
        ctx3.strokeStyle = "var(--neon-red)";
        ctx3.strokeRect(silX - 85, silY - 15, 45, 50);
        ctx3.font = "8px var(--font-mono)";
        ctx3.fillStyle = "var(--neon-red)";
        ctx3.fillText("UNNATURAL", silX - 82, silY - 4);
      }

      // CAM 4: Ball Telemetry Sensor Spike
      drawHighTechGrid(ctx4, w, h);
      ctx4.font = "10px var(--font-mono)";
      ctx4.fillStyle = "var(--text-muted)";
      ctx4.fillText("IMU COLLISION CLASSIFIER (500Hz)", 15, 25);
      
      ctx4.strokeStyle = "rgba(255,255,255,0.05)";
      ctx4.beginPath();
      ctx4.moveTo(30, 130);
      ctx4.lineTo(w - 20, 130);
      ctx4.stroke();
      
      // IMU graph with spike at frame 60
      ctx4.strokeStyle = "var(--neon-blue)";
      ctx4.lineWidth = 2;
      ctx4.beginPath();
      for (let x = 30; x < w - 20; x++) {
        const t = (x - 30) / (w - 50);
        const fIndex = Math.floor(t * 80);
        let val = 0;
        
        if (fIndex === 60) {
          val = 65; // handball contact spike
        } else if (fIndex > 60 && fIndex < 68) {
          val = Math.sin((fIndex - 60) * 1.2) * 25 / (fIndex - 59);
        } else {
          val = Math.sin(t * 70) * 1.5 + (Math.random() - 0.5) * 1.2;
        }
        
        const y = 130 - val;
        if (x === 30) ctx4.moveTo(x, y);
        else ctx4.lineTo(x, y);
      }
      ctx4.stroke();
      
      // Draw playhead vertical line
      const playheadX = 30 + (frame / 80) * (w - 50);
      ctx4.strokeStyle = "var(--neon-gold)";
      ctx4.lineWidth = 1;
      ctx4.beginPath();
      ctx4.moveTo(playheadX, 40);
      ctx4.lineTo(playheadX, 210);
      ctx4.stroke();
      
      // Spike tag
      const spikeX = 30 + (60 / 80) * (w - 50);
      ctx4.fillStyle = "var(--neon-gold)";
      ctx4.beginPath();
      ctx4.arc(spikeX, 65, 4, 0, Math.PI * 2);
      ctx4.fill();
      ctx4.fillText("IMPACT DETECTED (FRAME 60)", spikeX - 80, 50);
    }
  }
];

// --- RENDER HELPERS ---
function drawPitchGrid(ctx, w, h) {
  // Clear canvas
  ctx.fillStyle = "#090d16";
  ctx.fillRect(0, 0, w, h);
  
  // Grid Lines
  ctx.strokeStyle = "rgba(59, 130, 246, 0.05)";
  ctx.lineWidth = 1;
  const gridSize = 20;
  for (let x = 0; x < w; x += gridSize) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
  for (let y = 0; y < h; y += gridSize) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }
  
  // Pitch outlines
  ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
  ctx.lineWidth = 2;
  ctx.strokeRect(15, 15, w - 30, h - 30);
  
  // Center line
  ctx.beginPath();
  ctx.moveTo(w / 2, 15);
  ctx.lineTo(w / 2, h - 15);
  ctx.stroke();
  
  // Penalty areas
  ctx.strokeRect(15, h / 2 - 60, 45, 120);
  ctx.strokeRect(w - 60, h / 2 - 60, 45, 120);
}

function drawHighTechGrid(ctx, w, h) {
  ctx.fillStyle = "#060910";
  ctx.fillRect(0, 0, w, h);
  
  // Blueprint style grid
  ctx.strokeStyle = "rgba(59, 130, 246, 0.08)";
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 15) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
  for (let y = 0; y < h; y += 15) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }
  
  // Tech corner borders
  ctx.strokeStyle = "rgba(59, 130, 246, 0.3)";
  ctx.lineWidth = 1.5;
  
  // Top-left corner
  ctx.beginPath(); ctx.moveTo(8, 20); ctx.lineTo(8, 8); ctx.lineTo(20, 8); ctx.stroke();
  // Top-right corner
  ctx.beginPath(); ctx.moveTo(w - 8, 20); ctx.lineTo(w - 8, 8); ctx.lineTo(w - 20, 8); ctx.stroke();
  // Bottom-left corner
  ctx.beginPath(); ctx.moveTo(8, h - 20); ctx.lineTo(8, h - 8); ctx.lineTo(20, h - 8); ctx.stroke();
  // Bottom-right corner
  ctx.beginPath(); ctx.moveTo(w - 8, h - 20); ctx.lineTo(w - 8, h - 8); ctx.lineTo(w - 20, h - 8); ctx.stroke();
}

function drawPlayerNode(ctx, x, y, label, teamColor, drawMesh) {
  // Player dot
  ctx.fillStyle = teamColor === "red" ? "var(--neon-red)" : (teamColor === "blue" ? "var(--neon-blue)" : "#fff");
  ctx.beginPath();
  ctx.arc(x, y, 6, 0, Math.PI * 2);
  ctx.fill();
  
  // Label details
  ctx.font = "9px var(--font-mono)";
  ctx.fillStyle = "#fff";
  ctx.fillText(label, x - 20, y - 10);
  
  if (drawMesh) {
    // Tracking aura
    ctx.strokeStyle = teamColor === "red" ? "rgba(255, 51, 102, 0.3)" : "rgba(0, 217, 255, 0.3)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y, 14, 0, Math.PI * 2);
    ctx.stroke();
    
    // Draw crosshair indicators
    ctx.beginPath();
    ctx.moveTo(x - 18, y); ctx.lineTo(x - 12, y);
    ctx.moveTo(x + 12, y); ctx.lineTo(x + 18, y);
    ctx.moveTo(x, y - 18); ctx.lineTo(x, y - 12);
    ctx.moveTo(x, y + 12); ctx.lineTo(x, y + 18);
    ctx.stroke();
  }
}

function drawPlayerDot(ctx, x, y, color) {
  ctx.fillStyle = color === "red" ? "var(--neon-red)" : "var(--neon-blue)";
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fill();
}

function drawBall(ctx, x, y) {
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(x, y, 4, 0, Math.PI * 2);
  ctx.fill();
  // outline
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawSkeleton(ctx, x, y, scale, color, label, highlightHeel) {
  ctx.strokeStyle = color === "blue" ? "rgba(0, 162, 255, 0.6)" : (color === "red" ? "rgba(255, 51, 102, 0.6)" : "rgba(255,255,255,0.6)");
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  
  // Skeletal joints relative coordinates
  const points = {
    head: { x: 0, y: -45 },
    neck: { x: 0, y: -35 },
    shoulderL: { x: -12, y: -30 },
    shoulderR: { x: 12, y: -30 },
    elbowL: { x: -20, y: -15 },
    elbowR: { x: 20, y: -15 },
    handL: { x: -24, y: 5 },
    handR: { x: 24, y: 5 },
    hipL: { x: -8, y: 5 },
    hipR: { x: 8, y: 5 },
    kneeL: { x: -10, y: 28 },
    kneeR: { x: 10, y: 28 },
    ankleL: { x: -12, y: 50 },
    ankleR: { x: 14, y: 50 }
  };
  
  // Scaling and offsetting function
  const getPt = (p) => ({
    x: x + p.x * scale,
    y: y + p.y * scale
  });
  
  const head = getPt(points.head);
  const neck = getPt(points.neck);
  const shL = getPt(points.shoulderL);
  const shR = getPt(points.shoulderR);
  const elL = getPt(points.elbowL);
  const elR = getPt(points.elbowR);
  const hdL = getPt(points.handL);
  const hdR = getPt(points.handR);
  const hpL = getPt(points.hipL);
  const hpR = getPt(points.hipR);
  const knL = getPt(points.kneeL);
  const knR = getPt(points.kneeR);
  const akL = getPt(points.ankleL);
  const akR = getPt(points.ankleR);
  
  // Render bones
  ctx.beginPath();
  
  // Head
  ctx.arc(head.x, head.y, 6 * scale, 0, Math.PI * 2);
  
  // Spine & Torso
  ctx.moveTo(neck.x, neck.y);
  ctx.lineTo((hpL.x + hpR.x)/2, (hpL.y + hpR.y)/2);
  
  // Shoulders
  ctx.moveTo(shL.x, shL.y);
  ctx.lineTo(shR.x, shR.y);
  
  // Arm Left
  ctx.moveTo(shL.x, shL.y);
  ctx.lineTo(elL.x, elL.y);
  ctx.lineTo(hdL.x, hdL.y);
  
  // Arm Right
  ctx.moveTo(shR.x, shR.y);
  ctx.lineTo(elR.x, elR.y);
  ctx.lineTo(hdR.x, hdR.y);
  
  // Pelvis
  ctx.moveTo(hpL.x, hpL.y);
  ctx.lineTo(hpR.x, hpR.y);
  
  // Leg Left
  ctx.moveTo(hpL.x, hpL.y);
  ctx.lineTo(knL.x, knL.y);
  ctx.lineTo(akL.x, akL.y);
  
  // Leg Right
  ctx.moveTo(hpR.x, hpR.y);
  ctx.lineTo(knR.x, knR.y);
  ctx.lineTo(akR.x, akR.y);
  
  ctx.stroke();
  
  // Draw tracking points on joints
  ctx.fillStyle = "rgba(0, 217, 255, 0.8)";
  const joints = [neck, shL, shR, elL, elR, hdL, hdR, hpL, hpR, knL, knR, akL, akR];
  joints.forEach(j => {
    ctx.beginPath();
    ctx.arc(j.x, j.y, 2, 0, Math.PI * 2);
    ctx.fill();
  });
  
  if (highlightHeel) {
    // Highlight rearmost contact point (e.g. Defender Left Heel)
    ctx.strokeStyle = "var(--neon-green)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(akL.x, akL.y, 5, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Bounding mesh box
  ctx.strokeStyle = color === "blue" ? "rgba(0,162,255,0.18)" : "rgba(255,51,102,0.18)";
  ctx.strokeRect(x - 30 * scale, y - 55 * scale, 60 * scale, 115 * scale);
  
  ctx.font = "8px var(--font-mono)";
  ctx.fillStyle = color === "blue" ? "var(--neon-blue)" : "var(--neon-red)";
  ctx.fillText(label, x - 25 * scale, y - 58 * scale);
}

// --- STATE MANAGEMENT ---
class AppState {
  constructor() {
    this.activeIncidentIndex = 0;
    this.currentFrame = 0;
    this.isPlaying = false;
    this.playSpeed = 0.25;
    this.showAI = true;
    this.autoZoom = false;
    this.lastTime = 0;
    
    // Canvas contexts
    this.canvases = [
      document.getElementById("canvas-cam-1"),
      document.getElementById("canvas-cam-2"),
      document.getElementById("canvas-cam-3"),
      document.getElementById("canvas-cam-4")
    ];
    this.ctxs = this.canvases.map(c => c.getContext("2d"));
    
    // DOM Cache
    this.scrubber = document.getElementById("timeline-scrubber");
    this.frameCurrent = document.getElementById("frame-current");
    this.frameTotal = document.getElementById("frame-total");
    this.playPauseBtn = document.getElementById("btn-play-pause");
    this.playIcon = document.getElementById("play-icon");
    this.pauseIcon = document.getElementById("pause-icon");
    this.speedSelect = document.getElementById("speed-select");
    this.incidentTabs = document.querySelectorAll(".incident-tab");
    this.decisionText = document.getElementById("decision-text");
    this.confidencePercent = document.getElementById("confidence-percent");
    this.confidenceCircle = document.getElementById("confidence-circle-bar");
    this.reasoningTree = document.getElementById("reasoning-tree");
    this.ruleTitle = document.getElementById("rule-title");
    this.ruleDescription = document.getElementById("rule-description");
    this.ruleRefLink = document.querySelector(".rule-link");
    this.consistencyList = document.getElementById("consistency-list");
    this.ledgerWindow = document.getElementById("ledger-log-window");
    this.escalationBadge = document.getElementById("escalation-badge");
    this.integrityLock = document.getElementById("integrity-hash");
    
    // Setup event listeners
    this.initEventListeners();
    
    // Resize canvases
    this.resizeCanvases();
    window.addEventListener("resize", () => this.resizeCanvases());
    
    // Initial Load
    this.loadIncident(0);
    
    // Start animation loop
    requestAnimationFrame((ts) => this.loop(ts));
  }

  resizeCanvases() {
    this.canvases.forEach(canvas => {
      // Set resolution based on styling size to avoid blurry rendering
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    });
    this.render();
  }

  initEventListeners() {
    // Play / Pause
    this.playPauseBtn.addEventListener("click", () => this.togglePlayback());
    
    // Step Frame
    document.getElementById("btn-prev-frame").addEventListener("click", () => this.stepFrame(-1));
    document.getElementById("btn-next-frame").addEventListener("click", () => this.stepFrame(1));
    
    // Timeline Scrubber
    this.scrubber.addEventListener("input", (e) => {
      this.currentFrame = parseInt(e.target.value);
      this.render();
      this.logFrameTick();
    });
    
    // Play Speed dropdown
    this.speedSelect.addEventListener("change", (e) => {
      this.playSpeed = parseFloat(e.target.value);
      this.addLedgerEntry("SYSTEM", `Playback speed set to ${this.playSpeed}x`);
    });
    
    // Incident Tabs
    this.incidentTabs.forEach(tab => {
      tab.addEventListener("click", (e) => {
        const incidentIdx = parseInt(e.currentTarget.getAttribute("data-incident"));
        this.loadIncident(incidentIdx);
      });
    });
    
    // Overlays Toggle
    const toggleTrackingBtn = document.getElementById("btn-toggle-tracking");
    toggleTrackingBtn.addEventListener("click", () => {
      this.showAI = !this.showAI;
      toggleTrackingBtn.classList.toggle("active");
      this.render();
      this.addLedgerEntry("AI_ENGINE", `AI Tracking overlays toggled: ${this.showAI ? "ON" : "OFF"}`);
    });
    
    // Auto-zoom Toggle
    const toggleZoomBtn = document.getElementById("btn-toggle-zoomed");
    toggleZoomBtn.addEventListener("click", () => {
      this.autoZoom = !this.autoZoom;
      toggleZoomBtn.classList.toggle("active");
      this.render();
      this.addLedgerEntry("CAMERA_CORE", `Auto-Zoom crop mode toggled: ${this.autoZoom ? "ON" : "OFF"}`);
    });

    // Keyboard Shortcuts
    window.addEventListener("keydown", (e) => {
      if (e.code === "Space") {
        e.preventDefault(); // prevent page scroll
        this.togglePlayback();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        this.stepFrame(-1);
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        this.stepFrame(1);
      }
    });
  }

  loadIncident(index) {
    this.activeIncidentIndex = index;
    const incident = INCIDENTS[index];
    this.currentFrame = 0;
    this.isPlaying = false;
    
    // Reset play/pause button state
    this.playIcon.classList.remove("hidden");
    this.pauseIcon.classList.add("hidden");
    
    // Update scrubber UI limits
    this.scrubber.max = incident.framesCount;
    this.scrubber.value = 0;
    this.frameTotal.innerText = `FRAME ${String(incident.framesCount).padStart(3, '0')}`;
    this.frameCurrent.innerText = "FRAME 000";
    
    // Update active tab styling
    this.incidentTabs.forEach((tab, idx) => {
      if (idx === index) tab.classList.add("active");
      else tab.classList.remove("active");
    });
    
    // Populate text details
    this.decisionText.innerText = incident.decision;
    if (incident.decision.includes("OFFSIDE") || incident.decision.includes("HANDBALL") || incident.decision.includes("PENALTY")) {
      this.decisionText.className = "ruling-text text-red";
    } else if (incident.decision.includes("GOAL")) {
      this.decisionText.className = "ruling-text text-green";
    } else {
      this.decisionText.className = "ruling-text text-blue";
    }
    
    // Confidence radial fill
    this.confidencePercent.innerText = `${incident.confidence}%`;
    const circOffset = 263.89 * (1 - incident.confidence / 100);
    this.confidenceCircle.style.strokeDashoffset = circOffset;
    
    // Confidence circle coloring
    this.confidenceCircle.className.baseVal = "fg-circle " + (incident.confidence >= 95 ? "fg-green" : (incident.confidence >= 85 ? "fg-gold" : "fg-red"));
    
    // Escalation Badge
    if (incident.escalation === "AUTO-RESOLVED") {
      this.escalationBadge.innerText = "AUTO-RESOLVED";
      this.escalationBadge.className = "badge badge-auto";
    } else {
      this.escalationBadge.innerText = "ESCALATED TO OFR";
      this.escalationBadge.className = "badge badge-review";
    }
    
    // Rule details
    this.ruleTitle.innerText = incident.ruleTitle;
    this.ruleDescription.innerText = incident.ruleDescription;
    this.ruleRefLink.href = incident.ruleRef;
    
    // Reasoning List
    this.reasoningTree.innerHTML = "";
    incident.reasoning.forEach((reason, rIdx) => {
      const li = document.createElement("li");
      li.className = "reason-step";
      li.innerHTML = `
        <span class="step-num">0${rIdx+1}.</span>
        <span class="step-content">${reason}</span>
        <span class="step-verified">✓</span>
      `;
      this.reasoningTree.appendChild(li);
    });
    
    // Consistency Matrix List
    this.consistencyList.innerHTML = "";
    incident.consistency.forEach(comp => {
      const card = document.createElement("div");
      card.className = "comparison-card";
      card.innerHTML = `
        <div class="comp-header">
          <span class="comp-teams">${comp.fixture}</span>
          <span class="comp-date">${comp.date}</span>
        </div>
        <div class="comp-stats-row">
          <span class="comp-metric">${comp.metric}</span>
          <span class="comp-similarity">SIMILARITY: ${comp.similarity}</span>
          <span class="comp-ruling ${comp.safe ? 'ruling-safe' : 'ruling-foul'}">${comp.ruling}</span>
        </div>
      `;
      this.consistencyList.appendChild(card);
    });
    
    // Clear ledger and write calibration sequence
    this.ledgerWindow.innerHTML = "";
    this.addLedgerEntry("SYSTEM", `--- INITIALIZING Officiating PROTOCOL ---`);
    this.addLedgerEntry("SYSTEM", `Fixture Loaded: ${incident.fixture} (${incident.competition})`);
    this.addLedgerEntry("LEDGER", `Blockchain ledger synced. Genesis block verification: OK`);
    this.addLedgerEntry("CAMERA_CORE", `Calibrating 4 synchronous camera lenses... Status: OK`);
    this.addLedgerEntry("AI_ENGINE", `Loaded Neural Classifier node. Adherence metrics verified.`);
    
    this.render();
  }

  togglePlayback() {
    this.isPlaying = !this.isPlaying;
    if (this.isPlaying) {
      this.playIcon.classList.add("hidden");
      this.pauseIcon.classList.remove("hidden");
      this.addLedgerEntry("SYSTEM", `Playback started (${this.playSpeed}x speed)`);
    } else {
      this.playIcon.classList.remove("hidden");
      this.pauseIcon.classList.add("hidden");
      this.addLedgerEntry("SYSTEM", `Playback paused at frame ${this.currentFrame}`);
    }
  }

  stepFrame(dir) {
    const incident = INCIDENTS[this.activeIncidentIndex];
    this.currentFrame = Math.max(0, Math.min(incident.framesCount, this.currentFrame + dir));
    this.scrubber.value = this.currentFrame;
    this.render();
    this.logFrameTick();
  }

  logFrameTick() {
    const hash = this.generateFrameHash();
    this.integrityLock.innerText = `LOCK: ${hash.substring(0, 10).toUpperCase()}...`;
    
    // Add real-time audit logs for critical moments
    const incident = INCIDENTS[this.activeIncidentIndex];
    if (this.currentFrame === incident.kickFrame) {
      this.addLedgerEntry("AI_ENGINE", `EVENT TRIGGER AT FRAME ${this.currentFrame} | RULE BOUNDS DETECTED`, hash);
    } else if (this.currentFrame % 10 === 0) {
      this.addLedgerEntry("LEDGER", `Frame ${this.currentFrame} telemetry block written`, hash);
    }
  }

  generateFrameHash() {
    // Generate a pseudo-SHA256 based on incident & frame to represent block security
    const dataString = `incident_${this.activeIncidentIndex}_frame_${this.currentFrame}`;
    let hash = 0;
    for (let i = 0; i < dataString.length; i++) {
      const char = dataString.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32bit integer
    }
    
    // Pad to look like SHA256 hex string
    const hex = Math.abs(hash).toString(16).padEnd(8, 'e') + "f5a82cd93910ab384fe7d2cf01bc";
    return hex;
  }

  addLedgerEntry(module, msg, customHash = "") {
    const timestamp = new Date().toISOString().split('T')[1].slice(0, -1); // hh:mm:ss.ms
    const hash = customHash || this.generateFrameHash();
    
    const div = document.createElement("div");
    div.className = "log-entry";
    div.innerHTML = `
      <span class="log-time">[${timestamp}]</span>
      <span class="log-module">[${module}]</span>
      <span class="log-msg">${msg}</span>
      <span class="log-hash">HASH: ${hash.substring(0, 8).toUpperCase()}</span>
    `;
    
    this.ledgerWindow.appendChild(div);
    
    // Keep list clean (max 50 logs for memory performance)
    while (this.ledgerWindow.children.length > 50) {
      this.ledgerWindow.removeChild(this.ledgerWindow.firstChild);
    }
    
    // Auto scroll to bottom
    this.ledgerWindow.scrollTop = this.ledgerWindow.scrollHeight;
  }

  loop(timestamp) {
    if (!this.lastTime) this.lastTime = timestamp;
    const elapsed = timestamp - this.lastTime;
    
    if (this.isPlaying) {
      const incident = INCIDENTS[this.activeIncidentIndex];
      
      // Calculate how many frames to advance based on elapsed time and play speed
      // Base speed: 15 frames per second
      const framesPerSec = 15;
      const msPerFrame = 1000 / (framesPerSec * this.playSpeed);
      
      if (elapsed >= msPerFrame) {
        this.currentFrame++;
        if (this.currentFrame > incident.framesCount) {
          this.currentFrame = 0; // Loop back
        }
        
        this.scrubber.value = this.currentFrame;
        this.render();
        this.logFrameTick();
        
        this.lastTime = timestamp;
      }
    } else {
      this.lastTime = timestamp;
    }
    
    requestAnimationFrame((ts) => this.loop(ts));
  }

  render() {
    const incident = INCIDENTS[this.activeIncidentIndex];
    this.frameCurrent.innerText = `FRAME ${String(this.currentFrame).padStart(3, '0')}`;
    
    // Clear and Redraw Canvases
    this.ctxs.forEach(ctx => {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    });
    
    // Configure incident canvas renders
    const options = {
      showAI: this.showAI,
      autoZoom: this.autoZoom
    };
    
    incident.setup(this.ctxs[0], this.ctxs[1], this.ctxs[2], this.ctxs[3], this.currentFrame, options);
    
    // Overlay generic dashboard watermark indicator
    this.ctxs.forEach((ctx, idx) => {
      ctx.save();
      ctx.font = "8px var(--font-mono)";
      ctx.fillStyle = "rgba(255,255,255,0.18)";
      ctx.fillText(`NEO-VAR V2.8 // STREAM-CORRELATION: OK`, 15, ctx.canvas.height - 12);
      
      // Live red REC indicator at top right of cams
      ctx.fillStyle = "rgba(239, 68, 68, 0.7)";
      ctx.beginPath();
      ctx.arc(ctx.canvas.width - 25, 15, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = "bold 8px var(--font-mono)";
      ctx.fillStyle = "var(--text-muted)";
      ctx.fillText("LIVE", ctx.canvas.width - 18, 18);
      ctx.restore();
    });
  }
}

// --- INITIALIZE APPLICATION ON WINDOW LOAD ---
window.addEventListener("DOMContentLoaded", () => {
  new AppState();
});
