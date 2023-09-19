FROM node:18-alpine

ARG VITE_HOST
ARG SHOPIFY_API_KEY
ARG VITE_APP_SLUG
ARG VITE_MP_TOKEN
ARG VITE_BS_TOKEN
ENV VITE_HOST=$VITE_HOST
ENV SHOPIFY_API_KEY=$SHOPIFY_API_KEY
ENV VITE_APP_SLUG=$VITE_APP_SLUG
ENV VITE_MP_TOKEN=$VITE_MP_TOKEN
ENV VITE_BS_TOKEN=$VITE_BS_TOKEN
EXPOSE 8081
WORKDIR /app
COPY package.json package.json
COPY web/client/package.json frontend/package.json
COPY web/server/package.json backend/package.json
RUN npm --prefix ./client install
RUN npm --prefix ./server install
COPY web/@types @types
COPY web/client frontend
RUN npm --prefix ./client run build
RUN npm --prefix ./client run upload
COPY web/server backend
RUN npm --prefix ./server run prepare
RUN npm --prefix ./server run build
CMD cd backend && npm start
