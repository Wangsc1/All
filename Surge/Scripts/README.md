hostname：
account.wps.com,dayone.me,license.pdfexpert.com,mobile-api.adguard.com,education.github.com,backend.getdrafts.com,book.haitunwallet.com,mubu.com,lcs-mobile-cops.adobe.io,vira.llsapp.com,apic.musixmatch.com,api.rr.tv,ap*.intsig.net,buy.itunes.apple.com,apimboom2.globaldelight.net,m.client.10010,api.flexibits.com,api.diyidan.net,*.xiaoxiao*.com,m.pearkin.com

Scripts：
# Pear
http-response ^https:\/\/m\.pearkin\.com\/(api\/Movie\/WatchMovie|api\/Account\/CheckVip|api\/account\/IndexDetail) requires-body=1,script-path=https://raw.githubusercontent.com/Wangsc1/All/master/QuanX/Scripts/Pear.js
# 小小影视
http-response ^https:\/\/.*\.xiaoxiao.*\.com\/(vod\/reqplay\/|ucp/index|getGlobalData) requires-body=1,max-size=0,script-path=https://raw.githubusercontent.com/Wangsc1/All/master/Surge/Scripts/XXys.js
# 第一弹
http-response ^https:\/\/api\.diyidan\.net\/v0\.3\/(user\/personal_homepage|vip_user\/info|tv_series\/index\?appChanne) requires-body=1,max-size=0,script-path=https://raw.githubusercontent.com/Wangsc1/All/master/Surge/Scripts/Diyidan.js
# Fantastical
http-response ^https:\/\/api\.flexibits\.com\/v1\/(auth|account)\/(device|details|appstore-receipt)\/$ requires-body=1,max-size=0,script-path=https://raw.githubusercontent.com/Wangsc1/All/master/Surge/Scripts/Fantastical.js
# 联通营业厅广告
http-response https?://m\.client\.10010\.com/uniAdmsInterface/getHomePageAd requires-body=1,max-size=0,script-path=https://raw.githubusercontent.com/Wangsc1/All/master/Surge/Scripts/China_Unicom.js
# Boom
^https:\/\/apimboom2\.globaldelight\.net\/itunesreceipt_v2\.php$ https://raw.githubusercontent.com/langkhach270389/Scripting/master/boom.vip.rsp 302
# Bear
http-response ^https:\/\/buy\.itunes\.apple\.com\/verifyReceipt requires-body=1,max-size=0,script-path=https://raw.githubusercontent.com/Wangsc1/All/master/Surge/Scripts/Bear.js
# 扫描全能王
http-response https:\/\/(api|api-cs)\.intsig\.net\/purchase\/cs\/query_property\? requires-body=1,max-size=0,script-path=https://raw.githubusercontent.com/Wangsc1/All/master/Surge/Scripts/CamScanner.js
# 人人视频
http-response ^https:\/\/api\.rr\.tv(\/user\/privilege\/list|\/ad\/getAll) requires-body=1,max-size=0,script-path=https://raw.githubusercontent.com/Wangsc1/All/master/Surge/Scripts/RRtv.js
# Musixmatch
http-response ^https:\/\/apic\.musixmatch\.com\/ws\/1.1\/(user|config)\.get requires-body=1,max-size=0,script-path=https://raw.githubusercontent.com/Wangsc1/All/master/Surge/Scripts/Musixmatch.js
# 流利说•阅读
http-response ^https?:\/\/vira\.llsapp\.com\/api\/v2\/readings\/(accessible|limitation) requires-body=1,max-size=0,script-path=https://raw.githubusercontent.com/Wangsc1/All/master/Surge/Scripts/LLyd.js
# Photoshop
http-response ^https:\/\/lcs-mobile-cops\.adobe\.io\/mobile_profile requires-body=1,max-size=0,script-path=https://raw.githubusercontent.com/Wangsc1/All/master/Surge/Scripts/PhotoShop.js
# 幕布
http-response https:\/\/mubu\.com\/api\/app\/user\/info requires-body=1,max-size=0,debug=1,script-path=https://raw.githubusercontent.com/Wangsc1/All/master/Surge/Scripts/Mb.js
# 海豚记账
http-response https:\/\/book\.haitunwallet\.com\/app\/vip\/status requires-body=1,max-size=0,debug=1,script-path=https://raw.githubusercontent.com/Wangsc1/All/master/Surge/Scripts/HTJZ.js
# Drafts
http-response https:\/\/backend\.getdrafts\.com\/api\/.*\/verification* requires-body=1,max-size=0,script-path=https://raw.githubusercontent.com/Wangsc1/All/master/Surge/Scripts/Drafts.js
# WorkingCopy
http-response ^https:\/\/education\.github\.com\/api\/user$ requires-body=1,max-size=0,script-path=https://raw.githubusercontent.com/Wangsc1/All/master/Surge/Scripts/WorkingCopy.js
# Adguard
http-request https://mobile-api.adguard.com/api/1.0/status.html script-path=https://raw.githubusercontent.com/Wangsc1/All/master/Surge/Scripts/Adguard.js

^https:\/\/mobile-api\.adguard\.com\/api\/1\.0\/ios_validate_receipt$ https://raw.githubusercontent.com/langkhach270389/Scripting/master/Adguard.rsp 302
# Documents&PDF
http-response ^https:\/\/license\.pdfexpert\.com\/api\/.*\/(documents|pdfexpert6)\/subscription\/(refresh$|check$) requires-body=1,max-size=0,script-path=https://raw.githubusercontent.com/Wangsc1/All/master/Surge/Scripts/Documents&PDFExpert.js
# DayOne
http-response ^https:\/\/dayone\.me\/api\/(users|v2\/users\/account-status)$ requires-body=1,max-size=0,script-path=https://raw.githubusercontent.com/Wangsc1/All/master/Surge/Scripts/Dayone.js

//http-request ^https:\/\/dayone\.me\/api\/users$ script-path=https://raw.githubusercontent.com/Wangsc1/All/master/Surge/Scripts/Dayone-Pre.js
# WPS国际会员
http-response ^https://account.wps.com/api/users/ requires-body=1,max-size=0,script-path=https://raw.githubusercontent.com/Wangsc1/All/master/Surge/Scripts/WPS.js
