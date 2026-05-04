ansible
===

自动化运维工具

## 补充说明

**Ansible** 是开源的自动化运维工具，使用 SSH 连接管理目标主机，无需在被管理节点安装代理。通过 YAML 格式的 Playbook 描述自动化任务。

### 语法

```shell
ansible [options] <pattern> -m <module> -a <args>
ansible-playbook [options] playbook.yml
```

### 主机清单

```yaml
# /etc/ansible/hosts 或 inventory 文件

# 直接写主机
192.168.1.10
192.168.1.11

# 主机组
[webservers]
web1.example.com
web2.example.com
192.168.1.100

[dbservers]
db1.example.com
db2.example.com
192.168.1.200

# 定义变量
[webservers:vars]
http_port=80

# 组的组
[production:children]
webservers
dbservers

# 使用变量
[servers]
server1 ansible_host=192.168.1.10 ansible_user=root ansible_port=22
server2 ansible_host=192.168.1.11 ansible_user=admin

# 定义变量文件
# group_vars/webservers.yml
---
http_port: 80
max_clients: 200

# host_vars/server1.yml
---
ansible_user: root
ansible_port: 2222
```

### Ad-hoc 命令

```shell
# 基本格式
ansible <pattern> -m <module> -a <args> -i <inventory>

# Ping 所有主机
ansible all -m ping
ansible '*' -m ping

# Ping 指定组
ansible webservers -m ping

# 指定主机清单
ansible all -m ping -i inventory.yml

# 指定用户
ansible all -m ping -u username
ansible all -m ping --user=root

# 指定密码（不推荐，建议 SSH 密钥）
ansible all -m ping -u root -k
ansible all -m ping --private-key=~/.ssh/id_rsa

# 测试连接
ansible all -m ping -o               # 单行输出

# 执行命令
ansible all -a "uptime"
ansible all -m command -a "uptime"
ansible all -m shell -a "echo $HOSTNAME"
ansible all -m shell -a "df -h"

# 复制文件
ansible all -m copy -a "src=/local/file dest=/remote/path"
ansible all -m copy -a "src=/local/file dest=/remote/path mode=0644"
ansible all -m copy -a "content='Hello' dest=/tmp/test.txt"

# 安装包（yum）
ansible webservers -m yum -a "name=nginx state=present"
ansible webservers -m yum -a "name=nginx state=latest"
ansible webservers -m yum -a "name=nginx state=absent"

# 安装包（apt）
ansible dbservers -m apt -a "name=mysql-server state=present"
ansible all -m apt -a "name=vim update_cache=yes"

# 服务管理
ansible webservers -m service -a "name=nginx state=started"
ansible webservers -m service -a "name=nginx state=stopped"
ansible webservers -m service -a "name=nginx state=restarted"
ansible webservers -m service -a "name=nginx enabled=yes"

# 创建目录
ansible all -m file -a "path=/tmp/mydir state=directory mode=0755"

# 创建文件
ansible all -m file -a "path=/tmp/myfile state=touch mode=0644"

# 删除文件
ansible all -m file -a "path=/tmp/myfile state=absent"

# 获取事实
ansible all -m setup
ansible all -m setup -a "filter=ansible_eth*"

# 收集并输出主机信息
ansible all -m setup --tree /tmp/facts

# 安装 pip 包
ansible all -m pip -a "name=flask state=present"

# Git 操作
ansible all -m git -a "repo=https://github.com/user/repo.git dest=/opt/repo version=main"

# 等待端口
ansible all -m wait_for -a "port=80 timeout=60"

# 添加用户
ansible all -m user -a "name=john password={{ 'password' | password_hash('sha512') }}"
ansible all -m user -a "name=john state=absent"

# 调试输出
ansible all -m debug -a "msg='Hello World'"
ansible all -m debug -a "var=ansible_hostname"

# 同步文件（rsync）
ansible all -m synchronize -a "src=/local/path dest=/remote/path"

# 获取 URL
ansible all -m get_url -a "url=http://example.com/file dest=/tmp/file"

# 解压文件
ansible all -m unarchive -a "src=/tmp/file.tar.gz dest=/opt copy=no"
```

### Playbook 示例

```yaml
# playbook.yml 基本结构
---
- name: 部署 Web 服务器
  hosts: webservers
  become: yes
  vars:
    http_port: 80
    doc_root: /var/www/html

  tasks:
    - name: 安装 Nginx
      yum:
        name: nginx
        state: latest

    - name: 启动 Nginx 服务
      service:
        name: nginx
        state: started
        enabled: yes

    - name: 复制配置文件
      template:
        src: nginx.conf.j2
        dest: /etc/nginx/nginx.conf
      notify: reload nginx

    - name: 复制网站文件
      copy:
        src: index.html
        dest: "{{ doc_root }}/index.html"

  handlers:
    - name: reload nginx
      service:
        name: nginx
        state: reloaded

# 复杂 Playbook 示例
---
- name: 部署应用服务
  hosts: all
  become: yes
  strategy: free
  serial: 2

  vars:
    app_name: myapp
    app_version: 1.0.0

  pre_tasks:
    - name: 显示主机信息
      debug:
        msg: "部署 {{ app_name }} 到 {{ inventory_hostname }}"

  roles:
    - common
    - web

  tasks:
    - name: 安装依赖
      apt:
        name:
          - python3
          - python3-pip
          - nginx
        state: present
        update_cache: yes
      when: ansible_os_family == "Debian"

    - block:
        - name: 部署应用
          git:
            repo: "{{ app_repo }}"
            dest: /opt/{{ app_name }}
            version: "{{ app_version }}"

        - name: 安装 Python 依赖
          pip:
            requirements: /opt/{{ app_name }}/requirements.txt
            virtualenv: /opt/{{ app_name }}/venv

      rescue:
        - name: 部署失败回滚
          debug:
            msg: "部署失败，请检查日志"

      always:
        - name: 清理临时文件
          file:
            path: /tmp/{{ app_name }}
            state: absent

  post_tasks:
    - name: 发送通知
      debug:
        msg: "部署完成"
      run_once: yes

#++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

# 执行 playbook
ansible-playbook playbook.yml
ansible-playbook playbook.yml -f 10              # 并发 10
ansible-playbook playbook.yml --check            # 检查模式（测试）
ansible-playbook playbook.yml --diff             # 显示变化
ansible-playbook playbook.yml --step            # 逐步执行
ansible-playbook playbook.yml --tags="install"   # 只执行特定标签
ansible-playbook playbook.yml --skip-tags="test" # 跳过特定标签
ansible-playbook playbook.yml --limit="web1"    # 限制执行主机
ansible-playbook playbook.yml --vault-password-file vault.txt
```

### 常用命令

```shell
# 查看群组
ansible all --list-hosts -i inventory.yml

# 查看 playbook 语法
ansible-playbook playbook.yml --syntax-check

# 查看 host 清单
ansible-inventory --list -i inventory.yml
ansible-inventory --graph -i inventory.yml

# 加密文件
ansible-vault create secret.yml
ansible-vault encrypt secret.yml
ansible-vault decrypt secret.yml
ansible-vault edit secret.yml
ansible-vault view secret.yml

# 执行加密 playbook
ansible-playbook playbook.yml --ask-vault-pass

# 生成密码
ansible all -i localhost, -m debug -a "msg={{ 'password' | password_hash('sha512') }}"

# 检查运行
ansible-playbook playbook.yml --check --diff

# 使用 roles
ansible-galaxy init myrole                       # 创建角色
ansible-galaxy install username.rolename        # 安装角色
ansible-galaxy list                              # 列出已安装角色

# 动态清单脚本
ansible all -i ./inventory_script.py -m ping
```
