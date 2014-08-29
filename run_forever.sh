#!/bin/bash
# cron job checks if meteor is running, and restarts it if it isn't
# to schedule it as crontab for every minute: * * * * * sh ~/Logger/run_forever.sh


ps aux | grep meteor | grep -v grep || cd /Users/Gene/Logger/; nohup meteor --production > /Users/Gene/Desktop/this.out & bg & disown -h &
sleep 30
