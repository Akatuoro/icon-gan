

### Update Scenarios


#### All at once

queue length always <= 1

replace item in queue if new item comes along


#### One at a time

replace all items in queue if a new update comes along


#### Batch strategies

Make batches of parts to update, e.g. for a 3x3 update request:

first batch:

x| |x
 | | 
x| |x

second batch:

 |x| 
x| |x
 |x| 

The center part might not be needed, otherwise it could be inserted in any of the batches or an extra batch.


The onUpdate callback then needs to handle a position specification in the form:

```js
onUpdate(imageData, positionInfo) {
    // imageData of shape (w * n, h)
    // positionInfo of form [[x1, y1], [x2, y2], ..., [xn, yn]]
    for (const [x, y] of positionInfo) {
        ctx.putImageData(imageData, ...)
    }
}
```
