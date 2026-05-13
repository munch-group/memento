Add __iter__ to Graph() so I can iterate over verticies:

```
for i in self.vertices_length():
    yield self.vertex_at(i)
```
