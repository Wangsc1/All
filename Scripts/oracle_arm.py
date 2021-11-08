import oci
import re
import time
from oci.core import ComputeClient, VirtualNetworkClient
from oci.config import validate_config
import sys
import requests

# tg pusher config
USE_TG = True  # 如果启用tg推送 要设置为True
TG_BOT_TOKEN = ''  # 通过 @BotFather 申请获得，示例：1077xxx4424:AAFjv0FcqxxxxxxgEMGfi22B4yh15R5uw
TG_USER_ID = ''  # 用户、群组或频道 ID，示例：129xxx206
TG_API_HOST = 'api.telegram.org'  # 自建 API 反代地址，供网络环境无法访问时使用，网络正常则保持默认


def telegram(desp):
    data = (('chat_id', TG_USER_ID), ('text', '🤖️ 甲骨文ARM信息\n' + desp))
    response = requests.post('https://' + TG_API_HOST + '/bot' + TG_BOT_TOKEN +
                             '/sendMessage',
                             data=data)
    if response.status_code != 200:
        print('Telegram Bot 推送失败')
    else:
        print('Telegram Bot 推送成功')


class OciUser:
    """
    oci 用户配置文件的类
    """
    user: str
    fingerprint: str
    key_file: str
    tenancy: str
    region: str

    def __init__(self, configfile="~/.oci/config", profile="DEFAULT"):
        # todo 用户可以自定义制定config文件地址，暂时懒得写
        cfg = oci.config.from_file(file_location=configfile, profile_name=profile)
        validate_config(cfg)
        self.parse(cfg)

    def parse(self, cfg) -> None:
        print("parser cfg")
        self.user = cfg['user']
        self.fingerprint = cfg["fingerprint"]
        self.key_file = cfg["key_file"]
        self.tenancy = cfg['tenancy']
        self.region = cfg['region']

    def keys(self):
        return ("user", "fingerprint", "key_file", "tenancy", "region")

    def __getitem__(self, item):
        return getattr(self, item)

    def compartment_id(self):
        return self.tenancy


class FileParser:
    def __init__(self, file_path: str) -> None:
        self.parser(file_path)

    def parser(self, file_path):
        # compoartment id
        # print("开始解析参数")

        try:
            print("filepath", file_path)
            f = open(file_path, "r")
            self._filebuf = f.read()
            f.close()

        except Exception as e:
            print("main.tf文件打开失败,请再一次确认执行了正确操作,脚本退出", e)
            exit(0)

        compoartment_pat = re.compile('compartment_id = "(.*)"')
        self.compoartment_id = compoartment_pat.findall(self._filebuf).pop()

        # 内存
        memory_pat = re.compile('memory_in_gbs = "(.*)"')
        self.memory_in_gbs = float(memory_pat.findall(self._filebuf).pop())
        # 查找cpu个数
        cpu_pat = re.compile('ocpus = "(.*)"')
        self.ocpus = float(cpu_pat.findall(self._filebuf).pop())

        # 可用域
        ava_domain_pat = re.compile('availability_domain = "(.*)"')

        self.availability_domain = ava_domain_pat.findall(self._filebuf).pop()

        # 子网id
        subnet_pat = re.compile('subnet_id = "(.*)"')
        self.subnet_id = subnet_pat.findall(self._filebuf).pop()
        # 实例名称
        disname_pat = re.compile('display_name = "(.*)"')
        disname = disname_pat.findall(self._filebuf).pop()
        self.display_name = disname.strip().replace(" ", "-")

        # imageid
        imageid_pat = re.compile('source_id = "(.*)"')
        self.image_id = imageid_pat.findall(self._filebuf)[0]
        # 硬盘大小
        oot_volume_size_in_gbs_pat = re.compile('boot_volume_size_in_gbs = "(.*)"')
        try:
            self.boot_volume_size_in_gbs = float(oot_volume_size_in_gbs_pat.findall(self._filebuf).pop())
        except IndexError:
            self.boot_volume_size_in_gbs = 50.0

        # print("硬盘大小", self.boot_volume_size_in_gbs)
        # 读取密钥
        ssh_rsa_pat = re.compile('"ssh_authorized_keys" = "(.*)"')
        try:
            self.ssh_authorized_keys = ssh_rsa_pat.findall(self._filebuf).pop()
        except Exception as e:
            print("推荐创建堆栈的时候下载ssh key，理论上是可以不用的，但是我没写😂,麻烦重新创建吧")

    @property
    def ssh_authorized_keys(self):
        self._sshkey

    @ssh_authorized_keys.setter
    def ssh_authorized_keys(self, key):
        self._sshkey = key

    @property
    def boot_volume_size_in_gbs(self):
        return self._volsize

    @boot_volume_size_in_gbs.setter
    def boot_volume_size_in_gbs(self, size):
        self._volsize = size

    @property
    def image_id(self):
        return self._imgid

    @image_id.setter
    def image_id(self, imageid):
        self._imgid = imageid

    @property
    def display_name(self):
        return self._dname

    @display_name.setter
    def display_name(self, name):
        self._dname = name

    @property
    def subnet_id(self):
        return self._subid

    @subnet_id.setter
    def subnet_id(self, sid):
        self._subid = sid

    @property
    def compoartment_id(self):
        return self._comid

    @compoartment_id.setter
    def compoartment_id(self, cid):
        self._comid = cid

    @property
    def memory_in_gbs(self):
        return self._mm

    @memory_in_gbs.setter
    def memory_in_gbs(self, mm):
        self._mm = mm

    @property
    def ocpus(self):
        return self._cpu

    @ocpus.setter
    def ocpus(self, cpu_count):
        self._cpu = cpu_count

    @property
    def availability_domain(self):
        return self._adomain

    @availability_domain.setter
    def availability_domain(self, domain):
        self._adomain = domain


class InsCreate:
    shape = 'VM.Standard.A1.Flex'
    sleep_time = 5.0
    try_count = 0
    desp = ""

    def __init__(self, user: OciUser, filepath) -> None:
        self._user = user
        self._client = ComputeClient(config=dict(user))
        self.tf = FileParser(filepath)

    def create(self):
        # print("与运行创建活动")
        # 开启一个tg的原始推送
        text = "👻 开始新建：\n区域:{}\n实例:{},CPU:{}C-内存:{}G-硬盘:{}G".format(
            self.tf.availability_domain,
            self.tf.display_name,
            self.tf.ocpus,
            self.tf.memory_in_gbs,
            self.tf.boot_volume_size_in_gbs)
        telegram(text)

        while True:
            try:
                ins = self.lunch_instance()  # 应该返回具体的成功的数据
            except oci.exceptions.ServiceError as e:
                if e.status == 429 and e.code == 'TooManyRequests' and e.message == 'Too many requests for the user':
                    # 被限速了，改一下时间
                    print("请求太快了，自动调整请求时间ing...")
                    if self.sleep_time < 60:
                        self.sleep_time += 10
                elif not (e.status == 500 and e.code == 'InternalError' and e.message == 'Out of host capacity.'):
                    # 可能是别的错误，也有可能是 达到上限了，要去查看一下是否开通成功，也有可能错误了
                    self.logp("❌发生错误,脚本停止!请检查参数或github反馈/查找 相关问题:{}".format(e))
                    telegram(self.desp)
                    raise e
                else:
                    # 没有被限速，恢复减少的时间
                    print("目前没有请求限速,狂刷中....")
                    if self.sleep_time > 15:
                        self.sleep_time -= 10
                print("本次返回值为:",e)
                time.sleep(self.sleep_time)
            else:
                #  开通成功 ，ins 就是返回的数据
                #  可以等一会去请求实例的ip
                # print("开通成功之后的ins:\n\n", ins, type(ins))
                self.logp("🎉 新建成功：\n区域:{}\n实例:{}-CPU:{}C-内存:{}G\n".format(
                    self.try_count + 1,
                    self.tf.availability_domain,
                    self.tf.display_name,
                    self.tf.ocpus,
                    self.tf.memory_in_gbs,
                ))
                self.ins_id = ins.id
                self.check_public_ip()

                telegram(self.desp)
                break
            finally:
                self.try_count += 1
                print("抢注中，经过:{}尝试".format(self.try_count))

    def check_public_ip(self):

        network_client = VirtualNetworkClient(
            config=dict(self._user))
        while True:
            attachments = self._client.list_vnic_attachments(compartment_id=self._user.compartment_id(),
                                                             instance_id=self.ins_id)
            data = attachments.data
            if len(data) != 0:
                print("开始查找vnic id ")
                vnic_id = data[0].vnic_id
                public_ip = network_client.get_vnic(vnic_id).data.public_ip
                self.logp("🌐 IP地址：{}\n👉 后台登录：https://www.oracle.com/cn/cloud/sign-in.html".format(public_ip))
                self.public_ip = public_ip
                break
            time.sleep(5)

    def lunch_instance(self):
        return self._client.launch_instance(oci.core.models.LaunchInstanceDetails(
            display_name=self.tf.display_name,
            compartment_id=self.tf.compoartment_id,
            shape=self.shape,
            shape_config=oci.core.models.LaunchInstanceShapeConfigDetails(ocpus=self.tf.ocpus,
                                                                          memory_in_gbs=self.tf.memory_in_gbs),
            availability_domain=self.tf.availability_domain,
            create_vnic_details=oci.core.models.CreateVnicDetails(subnet_id=self.tf.subnet_id,
                                                                  hostname_label=self.tf.display_name),
            source_details=oci.core.models.InstanceSourceViaImageDetails(
                image_id=self.tf.image_id,
                boot_volume_size_in_gbs=self.tf.boot_volume_size_in_gbs,
            ),
            metadata=dict(ssh_authorized_keys=self.tf.ssh_authorized_keys),
            is_pv_encryption_in_transit_enabled=True,
        )).data

    def logp(self, text):
        print(text)
        if USE_TG:
            self.desp += text


if __name__ == "__main__":
    user = OciUser()
    path = sys.argv[1]
    ins = InsCreate(user, path)
    ins.create()