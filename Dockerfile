FROM node:18-alpine

ARG VITE_HOST
ARG SHOPIFY_API_KEY
ARG VITE_APP_SLUG
ENV VITE_HOST=$VITE_HOST
ENV SHOPIFY_API_KEY=$SHOPIFY_API_KEY
ENV VITE_APP_SLUG=$VITE_APP_SLUG
EXPOSE 8081
WORKDIR /app
COPY package.json package.json
COPY web/frontend/package.json client/package.json
COPY web/backend/package.json server/package.json
RUN npm --prefix ./client install
RUN npm --prefix ./server install
COPY web/@types @types
COPY web/frontend client
RUN npm --prefix ./client run build
RUN npm --prefix ./client run upload
COPY web/backend server
RUN npm --prefix ./server run prepare
RUN npm --prefix ./server run build
CMD cd backend && npm start
