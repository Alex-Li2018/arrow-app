# Node绘制
## VisualNode类

## 绘制内容

- 节点圆 node
- 节点的属性
- 节点名称 标签
### property

| 属性 | 描述 | 默认值|
| --- | --- | --- |
| node | 节点数据 |  |
| selected | 是否被选中 |  |
| editing | 是否正在编辑中 |  |
| internalRadius | 圆的半径 |  |
| radius | 圆的半径 + 边框 ||
| outsideComponentRadius |  ||
| fitRadius |  ||
| background | 背景色 ||
| internalVerticalOffset |  ||
| internalScaleFactor |  ||
| insideComponents | 节点内部的组件 caption label ||
| outsideComponents | 节点外部的组件 property ||
| outsideOrientation | 节点外的定位点 ||
| outsideOffset | 外部偏移量 ||

### method

| 方法 | 描述 | 默认值|
| --- | --- | --- |
| draw() | 绘制 |  |
| boundingBox() | 节点上下左右的坐标轴 |  |
| distanceFrom() |  |  |


## NodeBackground类

- 绘制圆形节点 圆形图片节点
### property

| 属性 | 描述 | 默认值|
| --- | --- | --- |
| position | 定位位置 |  |
| internalRadius | 内部半径 |  |
| editing | 是否可编辑 |  |
| backgroundColor | 背景色 |  |
| borderWidth | 边框宽度 ||
| borderColor | 边框颜色 ||
| selectionColor | 选中的颜色 ||
| imageInfo | 图片信息 ||


### method

| 方法 | 描述 | 默认值|
| --- | --- | --- |
| draw | 画节点 |  |
| drawSelectionIndicator |  |  |


## NodeCaptionInsideNode类

- 绘制在节点内部的标题，标题还有包裹一层

### property

| 属性 | 描述 | 默认值|
| --- | --- | --- |
| editing | 是否正在编辑中 |  |
| font | 字体 |  |
| fontColor | 字体颜色 |  |
| orientation | 定位 | ``` {horizontal: 'center', vertical: 'center'} ``` |
| lineHeight | 行高 | ``` fontSize * 2 ``` |
| layout | 布局 ||
| width | 宽 ||
| height | 高 ||


### method

| 方法 | 描述 | 默认值|
| --- | --- | --- |
| draw | 画节点 |  |
| boundingBox | 上下左右的坐标点 |  |
| distanceFrom |  |  |


## NodeCaptionFillNode类

- 绘制在节点内部的标题，适配整个节点

### property

| 属性 | 描述 | 默认值|
| --- | --- | --- |
| editing | 是否正在编辑中 |  |
| font | 字体 |  |
| fontColor | 字体颜色 |  |
| orientation | 定位 | ``` {horizontal: 'center', vertical: 'center'} ``` |
| lineHeight | 行高 | ``` fontSize * 2 ``` |
| layout | 布局 ||
| radius | 半径 ||


### method

| 方法 | 描述 | 默认值|
| --- | --- | --- |
| draw | 画节点 |  |
| boundingBox | 上下左右的坐标点 |  |
| distanceFrom |  |  |


## NodeCaptionInsideNode类

### property

| 属性 | 描述 | 默认值|
| --- | --- | --- |
| editing | 是否正在编辑中 |  |
| orientation | 定位 | ``` {horizontal: 'center', vertical: 'center'} ``` |
| width | 宽 ||
| height | 高 ||
| icon | Icon实例 ||


### method

| 方法 | 描述 | 默认值|
| --- | --- | --- |
| draw | 画节点 |  |
| boundingBox | 上下左右的坐标点 |  |
| distanceFrom |  |  |
