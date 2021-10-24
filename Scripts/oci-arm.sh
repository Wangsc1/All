#!/usr/bin/env sh
trap 'onCtrlC' INT

# 甲骨文ARM实例自动新建/升级脚本

#====== 新建实例配置相关 ======#
# 区域ID [availability_domain]
Available_Domain=''
# 镜像 [source_id]
Image_ID=''
# 子网ID [subnet_id]
Subnet_ID=''
# 公钥 [ssh_authorized_keys]
SSH_Key_PUB=""
# 租户ID [compartment_id]
Compartment_ID=''
# 配置 [shape]
Shape='VM.Standard.A1.Flex'
# CPU数目
CPU=4
# 内存大小(GB)
RAM=24
# 引导卷大小(GB)
HD=200
# 实例名称
Instance_Name="xxx-ARM"


#====== 升级实例配置相关 ======#
# 升级的实例OCID [实例详细信息页面的OCID]
_Instance_ID=""
# 升级到CPU个数
_CPU=4
# 升级到内存大小(GB)
_RAM=24


#====== 新建/升级实例时间间隔 ======#
# 指定一个时间范围，随机生成时间间隔。
min_Time=3
max_Time=10


#====== OCI个人资料名称 ======#
# 执行 oci setup config 配置oci时，「Enter the name of the profile you would like to create:」输入的名称，不输入直接回车名称默认为 DEFAULT。
profile="DEFAULT"


#====== Telegram bot 消息提醒配置相关 ======#
# 发送消息提醒。0: 不发送；1: 发送
SEND_MSG=1
# Telegram bot token, 通过 BotFather(https://t.me/BotFather) 创建一个 Bot 获取 token。
TOKEN=
# 接收消息的Telegram ID, 通过 IDBot(https://t.me/myidbot) 获取个人 Telegram ID。
CHAT_ID=
# 使用代理访问Telegram bot发送消息的API。0: 不使用；1: 使用。
PROXY=0
# Socks 代理
PROXY_URL=socks5://127.0.0.1:1080
# Http 代理
#PROXY_URL=http://127.0.0.1:1087


###============================== 以下区域无需修改 ==============================###
PROJECT="甲骨文 OCI 新建/升级实例"
VER=1.0.0
PROJECT_ENTRY="$0"
LOG_DIR=./log
LOG_FILE=$LOG_DIR/OCI.log
NO_TIMESTAMP=0
# 保存日志到文件。0:不保存；1:保存
SAVE_LOG=1

# Telegram bot 发送消息 API 
URL="https://api.telegram.org/bot${TOKEN}/sendMessage"


#################################################################################

# 新建实例
oci_launch_instance() {
    oci compute instance launch --profile $profile \
    --availability-domain $Available_Domain \
    --image-id $Image_ID \
    --subnet-id $Subnet_ID \
    --shape $Shape \
    --assign-public-ip true \
    --metadata '{"ssh_authorized_keys": "'"${SSH_Key_PUB}"'"}' \
    --compartment-id $Compartment_ID \
    --shape-config '{"ocpus":'$CPU',"memory_in_gbs":'$RAM'}' \
    --boot-volume-size-in-gbs $HD \
    --display-name $Instance_Name
}
launch_instance() {
    msg_text="开始新建实例 👉 ${Instance_Name} : ${CPU}C${RAM}G"
    info "$msg_text"
    sendMessage "$msg_text"
    while [ true ]; do
        _warn "正在尝试新建实例..."
        ret=$(oci_launch_instance 2>&1)
        #ret=${ret#*:}
        ret=${ret#*ServiceError:}
        status=$(echo "${ret}" | jq '.status' 2> /dev/null)
        message=$(echo "${ret}" | jq '.message' 2> /dev/null)

        #oci_launch_instance > ${LOG_DIR}/result.json 2>&1
        #sed -i '' '1d' ${LOG_DIR}/result.json
        #status="$(cat ${LOG_DIR}/result.json | jq '.status')"
        #message="$(cat ${LOG_DIR}/result.json | jq '.message')"
        #_info "$status, $message"

        msg_text="Message: ${message}, Status: ${status}"
        case "${status}" in
        500)
            debug "$msg_text"
            ;;
        429)
            debug "$msg_text"
            ;;
        502)
            error "$msg_text"
            sendMessage "脚本已停止, ${msg_text}"
            break
            ;;
        503)
            error "$msg_text"
            sendMessage "脚本已停止, ${msg_text}"
            break
            ;;
        400)
            error "$msg_text"
            sendMessage "脚本已停止, ${msg_text}"
            break
            ;;
        401)
            error "$msg_text"
            sendMessage "脚本已停止, ${msg_text}"
            break
            ;;
        404)
            error "$msg_text"
            sendMessage "脚本已停止, ${msg_text}"
            break
            ;;
        409)
            error "$msg_text"
            sendMessage "脚本已停止, ${msg_text}"
            break
            ;;
        *)
            if [ -n "$(echo "$ret" | grep -i "data")" ]; then
                # 实例新建成功
                text_success="🎉 实例 ${Instance_Name} : ${CPU}C${RAM}G 新建成功 👉 [success.json]"
                info "${text_success}"
                sendMessage "${text_success}"
                echo "$ret" > ./success.json 2>&1
                sleep 3s
                break
                exit 0
            else
                local text_error="脚本已停止, $ret"
                error "$text_error"
                sendMessage "$text_error"
                break
                exit
            fi
            ;;
        esac
        local interval=$(random_range $min_Time $max_Time)
        sleep $interval
    done
}

# 升级实例
oci_update_instance() {
    oci compute instance update --profile ${profile} \
	--instance-id ${_Instance_ID} \
	--shape-config '{"ocpus":'${_CPU}',"memory_in_gbs":'${_RAM}'}' \
	--force
}
update_instance() {
    msg_text="开始升级实例到 ${_CPU} Core CPU, ${_RAM} GB RAM "
    info "$msg_text"
    sendMessage "$msg_text"
    while [ true ]; do
        _warn "正在尝试升级实例..."
        ret=$(oci_update_instance 2>&1)
        ret=${ret#*ServiceError:}
        status=$(echo "${ret}" | jq '.status' 2> /dev/null)
        message=$(echo "${ret}" | jq '.message' 2> /dev/null)
        msg_text="Message: ${message}, Status: ${status}"
        case "${status}" in
        500)
            debug "$msg_text"
            ;;
        429)
            debug "$msg_text"
            ;;
        502)
            error "$msg_text"
            sendMessage "脚本已停止, ${msg_text}"
            break
            ;;
        503)
            error "$msg_text"
            sendMessage "脚本已停止, ${msg_text}"
            break
            ;;
        400)
            error "$msg_text"
            sendMessage "脚本已停止, ${msg_text}"
            break
            ;;
        401)
            error "$msg_text"
            sendMessage "脚本已停止, ${msg_text}"
            break
            ;;
        404)
            error "$msg_text"
            sendMessage "脚本已停止, ${msg_text}"
            break
            ;;
        409)
            error "$msg_text"
            sendMessage "脚本已停止, ${msg_text}"
            break
            ;;
        *)
            if [ -n "$(echo "$ret" | grep -i "data")" ]; then
                text_success="🎉 实例已成功升级到 ${_CPU} Core CPU, ${_RAM} GB RAM 👉 [success.json]"
                info "${text_success}"
                sendMessage "${text_success}"
                echo "$ret" > ./success.json 2>&1
                sleep 3s
                break
                exit 0
            else
                local text_error="脚本已停止, $ret"
                error "$text_error"
                sendMessage "$text_error"
                break
                exit
            fi
            ;;
        esac
        local interval=$(random_range $min_Time $max_Time)
        sleep $interval
    done
}

# 生成指定范围随机数
random_range() {
    local min=$1
    local max=$2
    echo $((RANDOM % ($max - $min) + $min))
}

sendMessage() {
    if [ 1 -eq $SEND_MSG ]; then
        if [ 1 -eq $PROXY ]; then
            result=$(curl --connect-timeout 10 --max-time 10 -s -S -x $PROXY_URL -X POST $URL -d parse_mode=Markdown -d chat_id=${CHAT_ID} -d text="*甲骨文信息*%0A${1}" 2>&1)
            if [ 0 -eq $? ]; then
                info "Telegram 消息提醒发送成功"
            else    
                error "Telegram 消息提醒发送失败, $result"
            fi
        else
            result=$(curl --connect-timeout 10 --max-time 10 -s -S -X POST $URL -d parse_mode=Markdown -d chat_id=${CHAT_ID} -d text="*甲骨文信息*%0A${1}" 2>&1)
            if [ 0 -eq $? ]; then
                info "Telegram 消息提醒发送成功"
            else    
                error "Telegram 消息提醒发送失败, $result"
            fi
        fi
    fi
}

onCtrlC() {
    error "检测到「Ctrl + C」，正在终止脚本..."
    sendMessage "脚本已停止运行。"
    exit 0
}

version() {
    echo "$PROJECT"
    echo "v$VER"
}

showhelp() {
    version
    echo "Usage: $PROJECT_ENTRY <command> ... [parameters ...]
Commands:
    -h, --help               Show this help message.
    -v, --version            Show version info.
    --launch                 Create instance.
    --update                 Update instance.


Parameters:
    --available-domain       区域ID
    --image-id               系统镜像ID
    --subnet-id              子网ID
    --shape                  配置类型
    --shape-config           配置参数：CPU个数、内存大小(GB)
    --boot-volume-size       引导卷大小（GB）
    --ssh-key-pub            SSH公钥
    --compartment-id         租户ID
    --instance-name          实例名称
    --instance-id            实例OCID，升级实例需要。
    --profile                配置oci时指定的别名，默认为DEFAULT。
                             当一台机器上面为多个甲骨文账号配置oci时，
                             需要指定不同的别名区分。
"
}

_printf_black() {
    printf '\33[1;30m%b\33[0m' "$1"
}
_printf_red() {
    printf '\33[1;31m%b\33[0m' "$1"
}
_printf_green() {
    printf '\33[1;32m%b\33[0m' "$1"
}
_printf_yellow() {
    printf '\33[1;33m%b\33[0m' "$1"
}
_printf_blue() {
    printf '\33[1;34m%b\33[0m' "$1"
}
_printf_purple() {
    printf '\33[1;35m%b\33[0m' "$1"
}
_printf_skyBlue() {
    printf '\33[1;36m%b\33[0m' "$1"
}
_printf_white() {
    printf '\33[1;37m%b\33[0m' "$1"
}
_printf_normal() {
    printf -- "%b" "$1"
}

_error() {
    if [ -z "$NO_TIMESTAMP" ] || [ "$NO_TIMESTAMP" = "0" ]; then
        printf -- "%s" "[$(date '+%Y-%m-%d %H:%M:%S')] " >&2
    fi
    if [ -z "$2" ]; then
        _printf_red "$1" >&2
    else
        _printf_red "$1='$2'" >&2
    fi
    printf "\n" >&2
    return 1
}
_warn() {
    _exitstatus="$?"  
    if [ -z "$NO_TIMESTAMP" ] || [ "$NO_TIMESTAMP" = "0" ]; then
        printf -- "%s" "[$(date '+%Y-%m-%d %H:%M:%S')] " >&2
    fi
    if [ -z "$2" ]; then
        _printf_yellow "$1" >&2
    else
        _printf_yellow "$1='$2'" >&2
    fi
    printf "\n" >&2
    # return the saved exit status
    return "$_exitstatus"
}
_info() {
    _exitstatus="$?"
    if [ -z "$NO_TIMESTAMP" ] || [ "$NO_TIMESTAMP" = "0" ]; then
        printf -- "%s" "[$(date '+%Y-%m-%d %H:%M:%S')] "
    fi
    if [ -z "$2" ]; then
        _printf_green "$1"
    else
        _printf_green "$1='$2'"
    fi
    printf "\n"
    return "$_exitstatus"
}
_debug() {
    _exitstatus="$?"
    if [ -z "$NO_TIMESTAMP" ] || [ "$NO_TIMESTAMP" = "0" ]; then
        printf -- "%s" "[$(date '+%Y-%m-%d %H:%M:%S')] "
    fi
    if [ -z "$2" ]; then
        _printf_normal "$1"
    else
        _printf_normal "$1='$2'"
    fi
    printf "\n"
    return "$_exitstatus"
}

error() {
    if [ $SAVE_LOG -eq 1 ]; then
        _error "$1" 2>&1 | tee -a $LOG_FILE
        return
    fi
    _error "$1"
}
warn() {
    if [ $SAVE_LOG -eq 1 ]; then
        _warn "$1" 2>&1 | tee -a $LOG_FILE
        return
    fi
    _warn "$1"
}
info() {
    if [ $SAVE_LOG -eq 1 ]; then
        _info "$1" 2>&1 | tee -a $LOG_FILE
        return
    fi
    _info "$1"
}
debug() {
    if [ $SAVE_LOG -eq 1 ]; then
        _debug "$1" 2>&1 | tee -a $LOG_FILE
        return
    fi
    _debug "$1"
}

install_JQ() {
    _warn "正在安装JQ..."
    if [ `uname` = 'Darwin' ]; then
        if [ "$(command -v brew)" ]; then
            # 使用brew安装jq
            brew install jq
        else
            # brew未安装
            _error "请手动安装Homebrew"
            exit
        fi
    elif [ $(uname) = 'Linux' ]; then
        source /etc/os-release
        case $ID in
        debian | ubuntu)
            sudo apt-get update -y
            sudo apt-get install jq -y
            ;;
        centos)
            sudo yum install epel-release -y
            sudo yum install jq -y
            ;;
        *)
            _error "请手动安装jq"
            exit
            ;;
        esac
    else
        _error "请手动安装jq"
        exit
    fi
}

_init() {
    _info "${PROJECT} 脚本正在启动..."
    if ! [ -d ./log/ ]; then
        _info "创建日志目录"
        mkdir ${LOG_DIR}
    fi
    # 检查oci命令行工具是否安装
    if [ -z "$(command -v oci)" ]; then
        _error "oci命令行工具未安装, 请手动安装"
        exit
    fi
    # 检查jq是否安装
    if [ -z "$(command -v jq)" ]; then
        install_JQ
    fi
}

_process() {
    _CMD=""
    while [ ${#} -gt 0 ]; do
        case "${1}" in
        --help | -h)
            showhelp
            return
            ;;
        --version | -v)
            version
            return
            ;;
        --launch)
            _CMD="launch"
            ;;
        --update)
            _CMD="update"
            ;;
        --available-domain)
            Available_Domain=$2
            shift
            ;;
        --image-id)
            Image_ID=$2
            shift
            ;;
        --subnet-id)
            Subnet_ID=$2
            shift
            ;;
        --shape)
            Shape=$2
            shift
            ;;
        --ssh-key-pub)
            SSH_Key_PUB=$2
            shift
            ;;
        --compartment-id)
            Compartment_ID=$2
            shift
            ;;
        --shape-config)
            CPU=$2
            RAM=$3
            _CPU=$2
            _RAM=$3
            shift 2
            ;;
        --boot-volume-size)
            HD=$2
            shift
            ;;
        --instance-name)
            Instance_Name=$2
            shift
            ;;
        --profile)
            profile=$2
            shift
            ;;
        --instance-id)
            _Instance_ID=$2
            shift
            ;;
        *)
            _error "Unknown parameter : $1"
            return 1
            ;;
        esac
        shift 1
    done

    _init

    case "${_CMD}" in
    launch) launch_instance ;;
    update) update_instance ;;
    *)
        if [ "$_CMD" ]; then
            _error "Invalid command: $_CMD"
        fi
        showhelp
        return 1
        ;;
    esac
}

_startswith() {
    _str="$1"
    _sub="$2"
    echo "$_str" | grep "^$_sub" >/dev/null 2>&1
}

main() {
    [ -z "$1" ] && showhelp && return
    if _startswith "$1" '-'; then _process "$@"; else "$@"; fi
}

main "$@"