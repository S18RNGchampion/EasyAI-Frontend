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
# 复制证书
COPY ./cert/easyai.host_bundle.crt /etc/nginx/ssl/easyai.host_bundle.crt
COPY ./cert/easyai.host.key /etc/nginx/ssl/easyai.host.key
COPY ./cert/easyai.host_bundle.pem /etc/nginx/ssl/easyai.host_bundle.pem
RUN chmod 644 /etc/nginx/ssl/easyai.host_bundle.pem \
    && chmod 644 /etc/nginx/ssl/easyai.host.key \
    && chmod 644 /etc/nginx/ssl/easyai.host_bundle.crt
