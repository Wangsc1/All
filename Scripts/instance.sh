#!/bin/bash
trap 'onCtrlC' INT			  				
#Author: 蜘蛛子   				   
#Telegram: https://t.me/Zhizhuzi			            
#Github: https://github.com/ZhizhuziQAQ/instance	     

# 0=新建 1=升配
Flag=0
# 区域ID【availability_domain】
Available_Domain=''
# 镜像ID【source_id】
Image_ID=''
# 子网ID【subnet-id】
Subnet_ID=''
# 默认申请ARM 请根据需求自行修改
Shape='VM.Standard.A1.Flex'
# 公钥【ssh_authorized_keys】
SSH_Key_PUB=""
# 租户ID【compartment_id】
Compartment_ID=''
# 实例CPU数目
xCPU=4
# 实例内存大小GB
xRAM=24
# 硬盘默认200GB
xHD=200
# 新建实例名字，喜欢取什么就取什么，可由英文数字组成
Instance_Name="xxx-ARM"
# 升配时才要填，填入需要升配的实例ID，如果没填入脚本会终止。升配需要三个参数 实例ID CPU 内存
InstanceID=""

#===========================================填写配置区域2====================================================#
# 消息通知机器人,填入你的机器人token
TOKEN=
# 通知接收人的Telegram ID 一般填自己的
CHAT_ID=
# Telegram API 无需更改
URL="https://api.telegram.org/bot${TOKEN}/sendMessage"

#===========================================以下无关区域=====================================================#
Font_Red="\033[31m";
Font_Green="\033[32m";
Font_Yellow="\033[33m";
Font_Blue="\033[34m";
Font_White="\033[37m";
Font_SkyBlue="\033[36m";
Font_Suffix="\033[0m";
#==========================================================================================================#
function api_launch(){
/root/bin/oci compute instance launch \
--availability-domain $Available_Domain \
--image-id $Image_ID \
--subnet-id $Subnet_ID \
--shape $Shape \
--assign-public-ip true \
--metadata '{"ssh_authorized_keys": "IyEvYmluL2Jhc2gKZWNobyByb290OldhbmdzYzEgfHN1ZG8gY2hwYXNzd2Qgcm9vdApzdWRvIHNlZCAtaSAicy9eI1w/UGVybWl0Um9vdExvZ2luLiovUGVybWl0Um9vdExvZ2luIHllcy9nIiAvZXRjL3NzaC9zc2hkX2NvbmZpZzsKc3VkbyBzZWQgLWkgInMvXiNcP1Bhc3N3b3JkQXV0aGVudGljYXRpb24uKi9QYXNzd29yZEF1dGhlbnRpY2F0aW9uIHllcy9nIiAvZXRjL3NzaC9zc2hkX2NvbmZpZzsKc3VkbyBzZXJ2aWNlIHNzaGQgcmVzdGFydA=="}' \
--compartment-id $Compartment_ID \
--shape-config '{"ocpus":'$xCPU',"memory_in_gbs":'$xRAM',"boot_volume_size_in_gbs":'$xHD'}' \
--display-name $Instance_Name
}
#==========================================================================================================#
function api_update(){
	/root/bin/oci compute instance update \
	--instance-id $InstanceID \
	--shape-config '{"ocpus":'$xCPU',"memory_in_gbs":'$xRAM'}' \
	--force
}
#==========================================================================================================#
function InstallJQ() {
	current_time=`date +"%Y-%m-%d %H:%M:%S"`
    if [ -e "/etc/redhat-release" ];then
        echo -e "["$current_time"]" "${Font_Green}正在安装依赖: epel-release${Font_Suffix}";
        yum install epel-release -y -q > /dev/null;
        echo -e "["$current_time"]" "${Font_Green}正在安装依赖: jq${Font_Suffix}";
        yum install jq -y -q > /dev/null;
    elif [[ $(cat /etc/os-release | grep '^ID=') =~ ubuntu ]] || [[ $(cat /etc/os-release | grep '^ID=') =~ debian ]];then
        echo -e "["$current_time"]" "${Font_Green}正在更新软件包列表...${Font_Suffix}";
        apt-get update -y > /dev/null;
        echo -e "["$current_time"]" "${Font_Green}正在安装依赖: jq${Font_Suffix}";
        apt-get install jq -y > /dev/null;
    elif [[ $(cat /etc/issue | grep '^ID=') =~ alpine ]];then
        apk update > /dev/null;
        echo -e "["$current_time"]" "${Font_Green}正在安装依赖: jq${Font_Suffix}";
        apk add jq > /dev/null;
    else
        echo -e "["$current_time"]" "${Font_Red}请手动安装jq${Font_Suffix}";
        exit;
    fi
}
#==========================================================================================================#
function InstallLOG(){
	current_time=`date +"%Y-%m-%d %H:%M:%S"`
	if ! [[ -d /root/success/ ]]; then
		echo -e "["$current_time"]" "${Font_Green}正在创建日志目录...${Font_Suffix}";
		mkdir /root/success
	else
		echo > /dev/null
	fi
	if ! [[ -f /root/success/success.log ]]; then
		echo -e "["$current_time"]" "${Font_Green}正在创建日志文件...${Font_Suffix}";
		touch /root/success/success.log
	else
		echo > /dev/null
	fi
	if ! [[ -f /root/oci_error.log ]]; then
		echo -e "["$current_time"]" "${Font_Green}正在创建日志文件...${Font_Suffix}";
		touch /root/oci_error.log
	else
		echo > /dev/null
	fi
}
function onCtrlC(){
    current_time=`date +"%Y-%m-%d %H:%M:%S"`
    echo -e "["$current_time"]" "${Font_Red}检测到【Ctrl+C】终止命令......${Font_Suffix}"
    echo -e "["$current_time"]" "${Font_Red}正在终止脚本......${Font_Suffix}"
    Msg_success="【甲骨文信息】：${Instance_Name} ${xCPU}c${xRAM}g 申请脚本已停止"
    curl -s -X POST $URL -d chat_id=${CHAT_ID} -d text="${Msg_success}"
    exit 0
}
#==========================================================================================================#
function InstanceUpate(){
	current_time=`date +"%Y-%m-%d %H:%M:%S"`
	if [[ Flag == 1  ]]; then
		if [[ $InstanceID == "" ]]; then
			echo -e "["$current_time"]" "${Font_Red}请设置需要升配的实例ID, 当前实例ID为空。${Font_Suffix}"
			echo -e "["$current_time"]" "${Font_Red}请设置需要升配的实例ID, 当前实例ID为空。${Font_Suffix}" >> /root/oci_error.log 2>&1
			Msg_warning="【甲骨文信息】：请设置需要升配的实例ID，当前ID为空。"
			curl -s -X POST $URL -d chat_id=${CHAT_ID} -d text="${Msg_warning}"
			exit 0
		else
			echo -e "["$current_time"]" "${Font_Yellow}当前升配实例ID为：${InstanceID}${Font_Suffix}"
		fi
	fi
}
#==========================================================================================================#
function CheckInit(){
	current_time=`date +"%Y-%m-%d %H:%M:%S"`
	echo -e "["$current_time"]" "${Font_Green}脚本正启动中…………${Font_Suffix}";
	sleep 1
	if ! [ -x "$(command -v jq)" ]; then
		InstallJQ
	else
		current_time=`date +"%Y-%m-%d %H:%M:%S"`
		echo -e "["$current_time"]" "${Font_Green}检测到依赖 JQ 已安装${Font_Suffix}";
		sleep 1
	fi
	InstallLOG
	current_time=`date +"%Y-%m-%d %H:%M:%S"`
	if [[ $Flag == 0 ]]; then
		echo -e "["$current_time"]" "${Font_SkyBlue}启动模式：新建模式${Font_Suffix}"
		sleep 1
		echo -e "["$current_time"]" "${Font_SkyBlue}检测待建配置, 配置为${Instance_Name} ${xCPU}c${xRAM}g${Font_Suffix}"
		sleep 1
		Msg_success="【甲骨文信息】：${Instance_Name} ${xCPU}c${xRAM}g 开始新建实例"
		curl -s -X POST $URL -d chat_id=${CHAT_ID} -d text="${Msg_success}"
		echo -e "\n"
		api_launch > /root/result.json 2>&1
	elif [[ $Flag == 1 ]]; then
		echo -e "["$current_time"]" "${Font_Yellow}启动模式：升级模式${Font_Suffix}"
		sleep 1
		echo -e "["$current_time"]" "${Font_Yellow}检测待升配置, 配置为${Instance_Name} ${xCPU}c${xRAM}g${Font_Suffix}"
		sleep 1
		Msg_success="【甲骨文信息】：${Instance_Name} ${xCPU}c${xRAM}g 开始升级实例"
		curl -s -X POST $URL -d chat_id=${CHAT_ID} -d text="${Msg_success}"
		echo -e "\n"
		api_update > /root/result.json 2>&1
	fi
}
#==========================================================================================================#
CheckInit
while [[ true ]]; do
	current_time=`date +"%Y-%m-%d %H:%M:%S"`
	outcome=500 # 防Ctrl + C 误报
	if [[ $Flag == 0 ]]; then
		echo -e "["$current_time"]" "${Font_SkyBlue}正在尝试新建实例中…………${Font_Suffix}"
		api_launch > /root/result.json 2>&1
	elif [[ $Flag == 1 ]]; then
		echo -e "["$current_time"]" "${Font_Yellow}正在尝试升级实例中…………${Font_Suffix}"
		api_update > /root/result.json 2>&1
	fi
	current_time=`date +"%Y-%m-%d %H:%M:%S"`
	sed -i '1d' /root/result.json
	outcome="$(cat /root/result.json | jq '.status')"
	case $outcome in
    500)
		echo -e "["$current_time"]" "实例状态：${Font_White}Out of host capacity${Font_Suffix}, 返回状态：""${Font_White}${outcome}${Font_Suffix}"
		echo -e "["$current_time"]" "实例状态：${Font_White}Out of host capacity${Font_Suffix}, 返回状态：""${Font_White}${outcome}${Font_Suffix}" >> /root/oci_error.log
    ;;
    429)
		echo -e "["$current_time"]" "实例状态：${Font_White}Too many requests for the user${Font_Suffix}, 返回状态：""${Font_White}${outcome}${Font_Suffix}"
		echo -e "["$current_time"]" "实例状态：${Font_White}Too many requests for the user${Font_Suffix}, 返回状态：""${Font_White}${outcome}${Font_Suffix}" >> /root/oci_error.log
    ;;
    409)
		echo -e "["$current_time"]" "实例状态：${Font_Red}Apply conflict${Font_Suffix}, 返回状态：""${Font_Red}${outcome}${Font_Suffix}"  
		echo -e "["$current_time"]" "实例状态：${Font_Red}Apply conflict${Font_Suffix}, 返回状态：""${Font_Red}${outcome}${Font_Suffix}" >> /root/oci_error.log
    	Msg_error="【甲骨文信息】：${Instance_Name}申请脚本已停止，返回信息为Apply conflict"
		curl -s -X POST $URL -d chat_id=${CHAT_ID} -d text="${Msg_error}"
		break
    ;;
    404)
		echo -e "["$current_time"]" "实例状态：${Font_Red}InvalidParameter or LimitExceed${Font_Suffix}, 返回状态：""${Font_Red}${outcome}${Font_Suffix}"
		echo -e "["$current_time"]" "实例状态：${Font_Red}InvalidParameter or LimitExceed${Font_Suffix}, 返回状态：""${Font_Red}${outcome}${Font_Suffix}" >> /root/oci_error.log
		Msg_error="【甲骨文信息】：${Instance_Name}申请脚本已停止，返回信息为InvalidParameter or LimitExceed"
		curl -s -X POST $URL -d chat_id=${CHAT_ID} -d text="${Msg_error}"
		break	
    ;;
    401)
		echo -e "["$current_time"]" "实例状态：${Font_Red}InvalidParameter or LimitExceed${Font_Suffix}, 返回状态：""${Font_Red}${outcome}${Font_Suffix}"
		echo -e "["$current_time"]" "实例状态：${Font_Red}InvalidParameter or LimitExceed${Font_Suffix}, 返回状态：""${Font_Red}${outcome}${Font_Suffix}" >> /root/oci_error.log
		Msg_error="【甲骨文信息】：${Instance_Name}申请脚本已停止，返回信息为InvalidParameter or LimitExceed"
		curl -s -X POST $URL -d chat_id=${CHAT_ID} -d text="${Msg_error}"
		break
    ;;
    503)
		echo -e "["$current_time"]" "实例状态：${Font_Red}InvalidParameter or LimitExceed${Font_Suffix}, 返回状态：""${Font_Red}${outcome}${Font_Suffix}"
		echo -e "["$current_time"]" "实例状态：${Font_Red}InvalidParameter or LimitExceed${Font_Suffix}, 返回状态：""${Font_Red}${outcome}${Font_Suffix}" >> /root/oci_error.log
		Msg_error="【甲骨文信息】：${Instance_Name}申请脚本已停止，返回信息为InvalidParameter or LimitExceed"
		curl -s -X POST $URL -d chat_id=${CHAT_ID} -d text="${Msg_error}"
		break
    ;;
    400)
		echo -e "["$current_time"]" "实例状态：${Font_Red}InvalidParameter or LimitExceed${Font_Suffix}, 返回状态：""${Font_Red}${outcome}${Font_Suffix}"
		echo -e "["$current_time"]" "实例状态：${Font_Red}InvalidParameter or LimitExceed${Font_Suffix}, 返回状态：""${Font_Red}${outcome}${Font_Suffix}" >> /root/oci_error.log
		Msg_error="【甲骨文信息】：${Instance_Name}申请脚本已停止，返回信息为InvalidParameter or LimitExceed"
		curl -s -X POST $URL -d chat_id=${CHAT_ID} -d text="${Msg_error}"
		break
    ;;
    401)
		echo -e "["$current_time"]" "实例状态：${Font_Red}NotAuthenticated${Font_Suffix}, 返回状态：""${Font_Red}${outcome}${Font_Suffix}"
		echo -e "["$current_time"]" "实例状态：${Font_Red}NotAuthenticated${Font_Suffix}, 返回状态：""${Font_Red}${outcome}${Font_Suffix}" >> /root/oci_error.log
		Msg_warning="【甲骨文信息】：${Instance_Name}申请脚本已停止，返回信息为NotAuthenticated"
		curl -s -X POST $URL -d chat_id=${CHAT_ID} -d text="${Msg_warning}"
		break
    ;;
    502)
		echo -e "["$current_time"]" "实例状态：${Font_Red}Bad Gateway${Font_Suffix}, 返回状态：""${Font_Red}${outcome}${Font_Suffix}"
		echo -e "["$current_time"]" "实例状态：${Font_Red}Bad Gateway${Font_Suffix}, 返回状态：""${Font_Red}${outcome}${Font_Suffix}" >> /root/oci_error.log
		Msg_warning="【甲骨文信息】：${Instance_Name}申请脚本已停止，返回信息为Bad Gateway"
		curl -s -X POST $URL -d chat_id=${CHAT_ID} -d text="${Msg_warning}"
		break
    ;;
    *)
		if [[ $Flag == 0 ]]; then
			echo -e "["$current_time"]" "${Font_SkyBlue}${Instance_Name} ${xCPU}c${xRAM}g 成功新建实例，正在发起通知…………${Font_Suffix}"
			echo -e "["$current_time"]" "${Font_SkyBlue}${Instance_Name} ${xCPU}c${xRAM}g 成功新建实例，正在发起通知…………${Font_Suffix}" >> /root/success/success.log
			Msg_success="【甲骨文信息】：${Instance_Name} ${xCPU}c${xRAM}g 新建实例成功"
			curl -s -X POST $URL -d chat_id=${CHAT_ID} -d text="${Msg_success}"
			echo -e "\n"
		elif [[ $Flag == 1 ]]; then
			echo -e "["$current_time"]" "${Font_Yellow}${Instance_Name} ${xCPU}c${xRAM}g 成功升级实例，正在发起通知…………${Font_Suffix}"
			echo -e "["$current_time"]" "${Font_Yellow}${Instance_Name} ${xCPU}c${xRAM}g 成功升级实例，正在发起通知…………${Font_Suffix}" >> /root/success/success.log
			Msg_success="【甲骨文信息】：${Instance_Name} ${xCPU}c${xRAM}g 实例升级成功"
			curl -s -X POST $URL -d chat_id=${CHAT_ID} -d text="${Msg_success}"
			echo -e "\n"
		fi
		cp /root/result.json /root/success
		sleep 30
		break
		exit 0
    ;;
	esac
done