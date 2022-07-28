# toolClass 

## ViewTransformation 

视口变化类

### property

| 属性 | 描述 | 默认值|
| --- | --- | --- |
| scale | 缩放大小 |  |
| offset | 偏移 | Vector(0, 0) |


### method

| 方法 | 描述 | 备注|
| --- | --- | --- |
| zoom | 缩放 |  |
| scroll | 滚动 |  |
| transform | 平移 |  |
| inverse | 反转 向当前的方向平移，并且缩放到原来的1 / this.scale |  |
| adjust |  |  |
| asCSSTransform | 返回css样式 | offset是Vector 实例 ```css ${this.offset.asCSSTransform()} scale(${this.scale})``` |


## Vector 

向量类

### property

| 属性 | 描述 | 默认值|
| --- | --- | --- |
| dx | x轴的大小 |  |
| dy | y轴的大小 |  |


### method

| 方法 | 描述 | 备注|
| --- | --- | --- |
| plus | 加 x,y同时增加 |  |
| minus | 减 x,y同时减少 |  |
| scale | 缩放 x,y同时缩放 |  |
| dot | 反转 向当前的方向平移，并且缩放到原来的1 / this.scale |  |
| invert | 翻转 |  |
| rotate | 旋转 |  |
| perpendicular |  |  |
| distance | 两点之间的距离 |  |
| unit | 单位向量 |  |
| angle | 两点之间的夹角 |  |
| dxdy | 返回[dx, dy] |  |
| asCSSTransform | 返回css样式 | ```css translate(${this.dx}px,${this.dy}px)``` |


## Point 

点类

### property

| 属性 | 描述 | 默认值|
| --- | --- | --- |
| x | x轴的大小 |  |
| y | y轴的大小 |  |


### method

| 方法 | 描述 | 备注|
| --- | --- | --- |
| vectorFrom | 当前点到另一个点到向量 |  |
| vectorFromOrigin | 当前点到原点的向量 |  |
| scale | 缩放 x,y同时缩放 |  |
| translate | 当前点平移一段距离到某个点 |  |
| rotate | 旋转 |  |
| isEqual | 两个点是否相等 |  |
| xy | ```js[x,y]``` |  |