# EvalCode Node FAQ

## Input Example
      
Input is any JSON object `[[103,1],[103,1]]` or `{foo:'bar'}`.
      
## How to write transform
      
Only write the function body in the text box, think about the function is:

```
function (input) { return input; }
```

Use `input` as the input data, use `return` to output the transformed data

## How to use dependencies

```
const res = await deps.axios({
  method: 'get',
  url: '/node-map/examples/data/geojson-point.json',
});
return res.data;
```