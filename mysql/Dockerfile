# cat Dockerfile
FROM mysql:8.0.33

RUN chown -R mysql:root /var/lib/mysql/

ENV MYSQL_DATABASE="url_shortener"
ENV MYSQL_USER="hey"
ENV MYSQL_PASSWORD="your_user_password"
ENV MYSQL_ROOT_PASSWORD="your_root_password"

EXPOSE 3306