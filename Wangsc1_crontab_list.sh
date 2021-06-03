# Docker自定义任务追加默认任务（">>"之前加上"|ts"可在日志每行前显示时间）

# 35 1,22 * * * node /scripts/jd_nzmh.js |ts >> /scripts/logs/jd_nzmh.log 2>&1

54 7 * * * node /https://raw.githubusercontent.com/Wangsc1/All/master/Scripts/jd_live_redrain.js |ts >> /scripts/logs/jd_live_test.log 2>&1