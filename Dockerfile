FROM nginxinc/nginx-unprivileged:stable-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html global.css app.js 404.html /usr/share/nginx/html/
COPY logo/ /usr/share/nginx/html/logo/
COPY components/ /usr/share/nginx/html/components/
COPY sections/ /usr/share/nginx/html/sections/

EXPOSE 8080
