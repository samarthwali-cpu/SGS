FROM nginxinc/nginx-unprivileged:stable-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html styles.css script.js /usr/share/nginx/html/
COPY logo/ /usr/share/nginx/html/logo/

EXPOSE 8080
