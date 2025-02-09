# 基础镜像
FROM nginx
# author
MAINTAINER xiaoyang

# 挂载目录
VOLUME /home/easyai/projects/easyai-frontend
# 创建目录
RUN mkdir -p /home/easyai/projects/easyai-frontend
# 指定路径
WORKDIR /home/easyai/projects/easyai-frontend
# 复制conf文件到路径
COPY ./conf/nginx.conf /etc/nginx/nginx.conf
# 复制html文件到路径
COPY ./html/dist /home/easyai/projects/easyai-frontend