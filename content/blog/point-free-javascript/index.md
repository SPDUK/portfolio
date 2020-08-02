---
title: Point-free code in JavaScript
date: 2020-08-02T16:16:15.411Z
type: javascript
action: code
---


If you've ever written code like this:

```js

function addFive(x) {
  return x + 5;
}

[1,2,3,4,5].map(function(x) {
  return addFive(x)
});
```

This is *exactly* the same as:

```js
function addFive(x) {
  return x + 5;
}

[1,2,3,4,5].map(addFive);
```

Press the "Run Code" button and you'll see the output is the same.

### There is a small difference to note though.
Essentially when using `[1,2,3,4,5].map(addFive)` **all** arguments that are passed by `.map` are being provided to `addFive`, in this case, it's fine and expected as `addFive` only accepts one argument, however, you could run into an issue if you don't understand this.

Here's an example where an output could be unexpected because you're passing **all** the arguments, not just the first one.

```js
[1,2,3,4,5].map(parseInt)
```


In this case, `.map` is passing the `index` (second argument) as the radix, effectively calling `parseInt(1,0)` , `parseInt(2, 1)` etc.

So to get around that, this is when *pointing* a singular argument to get the expected output would be useful.

```js
[1,2,3,4,5].map(x => parseInt(x))
```

If you run the code you'll see the output is `[1,2,3,4,5]` as we would expect.

___

### Using point-free code with fetch


```js
const toJson = x => x.json();

fetch('https://pokeapi.co/api/v2/pokemon/ditto')
  .then(toJson)
  .then(console.log)
  .catch(console.warn)

'Check the console for output'
```

As you can see, you don't need to write the dreaded `x => x.json()` in the middle of your `.then` chain or need to specifically supply the arguments to `console.log`, it will just log all the arguments provided to it by `.then`.

 The code is much cleaner and reads like a pipeline rather than a mess of confusing callback functions to run.


When using `axios` in replace of fetch in conjunction with `async/await` you can begin to create real clean code, for example:

 `const responses = await Promise.all(urls.map(axios.get))`


 ### Other examples

 ```js
  const handleClickListener = evt => alert(evt.target.innerText);
  const addClickListener = el => el.addEventListener('click', handleClickListener);
  document.querySelectorAll('h3').forEach(addClickListener);
 ```