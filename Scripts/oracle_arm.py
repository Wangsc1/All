
import requests
import random
import sys
import time
from subprocess import Popen, PIPE
import re

# tg pusher config
USE_TG = True  # 如果启用tg推送 要设置为True
TG_BOT_TOKEN = ''  # 通过 @BotFather 申请获得，示例：1077xxx4424:AAFjv0FcqxxxxxxgEMGfi22B4yh15R5uw
TG_USER_ID = ''  # 用户、群组或频道 ID，示例：129xxx206
TG_API_HOST = 'api.telegram.org'  # 自建 API 反代地址，供网络环境无法访问时使用，网络正常则保持默认

# 硬盘大小设置
HARDDRIVE_SIZE = 100



# 一些不用动的地方
domain = ""
cpu_count = ""
memory_size = ""
disp_name=""
SHELL_FILENAME = "arm.sh"

def telegram(desp):
    data = (('chat_id', TG_USER_ID), ('text', '甲骨文ARM信息\n' + desp))
    response = requests.post('https://' + TG_API_HOST + '/bot' + TG_BOT_TOKEN +
                             '/sendMessage',
                             data=data)
    if response.status_code != 200:
        print('Telegram Bot 推送失败')
    else:
        print('Telegram Bot 推送成功')


def tf_parser(buf):
    global domain
    global cpu_count
    global memory_size
    global disp_name
    ssh_rsa_pat = re.compile('"ssh_authorized_keys" = "(.*)"')
    ssh_rsa = ssh_rsa_pat.findall(buf).pop()

    # 可用域
    ava_domain_pat = re.compile('availability_domain = "(.*)"')

    ava_domain = ava_domain_pat.findall(buf).pop()
    
    domain = ava_domain

    # compoartment id

    compoartment_pat = re.compile('compartment_id = "(.*)"')
    compoartment = compoartment_pat.findall(buf).pop()

    # 是否设置公共ip
    pubip_pat = re.compile('assign_public_ip = "(.*)"')
    pubip = pubip_pat.findall(buf).pop()

    # 子网id
    subnet_pat = re.compile('subnet_id = "(.*)"')
    subnet = subnet_pat.findall(buf).pop()

    # 实例名称
    disname_pat = re.compile('display_name = "(.*)"')
    disname = disname_pat.findall(buf).pop()
    disname = disname.strip().replace(" ","-")
    disp_name = disname
    # 查找类型
    shape_pat = re.compile('shape = "(.*)"')
    shape = shape_pat.findall(buf).pop()

    # 内存
    memory_pat = re.compile('memory_in_gbs = "(.*)"')
    memory = memory_pat.findall(buf).pop()
    memory_size = memory
    # 查找cpu个数
    cpu_pat = re.compile('ocpus = "(.*)"')
    cpu = cpu_pat.findall(buf).pop()
    cpu_count = cpu
    # imageid
    imageid_pat = re.compile('source_id = "(.*)"')
    imageid = imageid_pat.findall(buf)[0]
    ssh = '{"ssh_authorized_keys":"%s"}' % ssh_rsa
    config = '{"ocpus":%s,"memory_in_gbs":%s}' % (
        cpu, memory,)
    oci_cmd = '''oci compute instance launch --availability-domain {} --image-id {} --subnet-id {} --shape {} --assign-public-ip {} --metadata '{}' --compartment-id {} --shape-config '{}' --boot-volume-size-in-gbs {} --display-name {}'''.format(
        ava_domain, imageid, subnet, shape, pubip, ssh, compoartment, config,HARDDRIVE_SIZE,disname)

    try:
        f = open(SHELL_FILENAME, "w+")
        f.write(oci_cmd)
        f.close
    except Exception as e:
        print(e)
        exit(-1)


def start():
    if USE_TG:
        telegram("🤖️ 开始新建\n区域{}:实例:{} ,{}C:{}G".format(
                        domain,disp_name,cpu_count, memory_size))
    cmd = "bash arm.sh"
    count = 0
    while True:
        a = Popen(cmd, shell=True, stdout=PIPE, stderr=PIPE, encoding="utf-8")
        count += 1
        res = a.communicate()[1]
        print(res)
        if 'LimitExceeded' in res:
            print(u"脚本配置失败或者已经成功创建机器")
            if USE_TG:
                telegram("🎉 新建成功\n区域{}:实例:{},{}C:{}G\n👉 点击查看 https://www.oracle.com/cn/cloud/sign-in.html".format(
                    count, domain, disp_name,cpu_count, memory_size))
            break
        time.sleep(random.randint(10, 15))


if __name__ == "__main__":
    tf_path = sys.argv[1]
    f = open(tf_path, "r")
    buf = f.read()
    f.close()
    tf_parser(buf)
    start()