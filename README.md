# Vue3 项目基于 Webpack5 的服务端渲染（SSR）实践

安装依赖：

```sh
npm install
```

开发模式：

```sh
npm run dev
```


构建/运行：

```sh
npm run build
cd dist
node index.js
```

# 流式渲染对服务端性能区别

未开启流式渲染：

![](https://esunr-image-bed.oss-cn-beijing.aliyuncs.com/picgo/20240503161739.png)

![](https://esunr-image-bed.oss-cn-beijing.aliyuncs.com/picgo/20240503161652.png)

开启流式渲染：

![](https://esunr-image-bed.oss-cn-beijing.aliyuncs.com/picgo/20240503162005.png)

![](https://esunr-image-bed.oss-cn-beijing.aliyuncs.com/picgo/20240503162058.png)
