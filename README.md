# mongo-indexer

mongo提交框架

## Props

```
{
  Model: mongo.model('news', new mongoose.Schema({}, {strict: false, _id: false})),
  maxIdPath: __dirname + '/../maxid',
  initMaxId: 0,
  getMaxId: function(results) {
    return _.last(results).id;
  },
  getDataAsync: function(maxId) {
    return Promise.resolve([]);
  }
}
```

## Method

```
setMaxId(maxId)
```
