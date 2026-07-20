#!/bin/bash
cd /home/agent-lead/creator-pilot
kill $(lsof -t -iTCP:3000 -sTCP:LISTEN) 2>/dev/null
sleep 1
set -a; source .env; set +a
nohup node server/index.js > /tmp/cp-server.log 2>&1 &
sleep 2
curl -s http://localhost:3000/api/health && echo " CreatorPilot started" || echo " FAILED"
