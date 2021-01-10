---
title: JavaScript 101 - Variables & Primitives
date: 2021-01-10T12:16:48.209Z
type: javascript
action: code
---




## What you'll learn

- Variables
- Memory in JavaScript 
- Execution context 
- Hoisting
- Basic Primitive values 
  - String
  - Number
  - Boolean
  - null
  - undefined
- When to use which primitive
- How to perform basic data manipulation
- Cleaner code best practices when using primitives

___


That list sounds like a *lot* for a something intended as a step 1 to learning JavaScript, don't worry though really all you're *actually* learning is variables and some basic data structures. This is intended as more of a "deep dive" where you'll understand fully what's going on.

```js
var num = 5;
var name = "john" 
```

And there you go, you've learned how to use Variables and primitive values! 🥳 🎉

You can probably read it even if you don't know how to code at all, just guessing what's happening is pretty easy, you're saying `num is equal to number 5` and `name is equal to the string "john"` ...How did JavaScript know what to do there? And what's even actually happening?

Hopefully by the end of this blog you'll have a much better understanding of why we write the code in that way, what JavaScript is actually doing under the hood to make that code work and which primitive value to use when.

## Variables

Variables are essentially a name for *something*, that *something* can be, well, whatever you like. It could be any data structure, think of it like a "box" you can just put something inside and when you go to look in that box, it's there.

In JavaScript the standard is to use camelCase for variable names.

For now we'll just use `var` to assign variables, later we'll introduce `let` and `const` as other ways of assigning variables.

```js
var box = "my cool stuff";
box
```

In this example, we quite literally named our variable `box` and into that box we placed a string of `my cool stuff`. 


> **You can think about variables based on their names** this is a super useful, later on you'll need to come up with a *lot* of variable names, and it will be helpful to name them well. 


Here's what's happening when you click `Run Code`:

- **Creation Phase** 
  -  JS evaluates the code block, seeing `box` as a variable and placing it into memory
  -  the left hand assignment of `box` is **declared** - *not yet assigned! it just exists in memory now* 
  -  the value of `box` is currently `undefined` 
  -  after declaring the value it is hoisted up to the top of the script *(more on this below)*
- **Execution Phase** 
  - JS executes the code, seeing `box` is declared and has been assigned a value
  - JS runs the code to evaluate the right hand **assignment** (`=`) and assign the string of `"my cool stuff"` to `box`
  - the `alert` function then runs - `box` has been assigned the string, so the value will be `my cool stuff` that appears at the top of the browser.

___


This may seem a little confusing, what's the difference between `declared` and `assigned`?

Try running this code example and you'll see the magic happening.

```js
alert(`first alert - name is: ${name}`); // undefined

var name = "Jim" // assignment

alert(`second alert - name is: ${name}`); // "Jim"
```

If you have written any code before you may have encountered errors writing code like this, how is it possible you're trying to do something with `name` in the code before you even create it?! If you were to reference any variable that had not been **declared** you will get an error. 


```js
console.log(foo) // Uncaught ReferenceError: foo is not defined
```

So we've proven that the creation phase finished with the first `alert`, JS is aware `name` exists in memory at that point, but hasn't been `assigned` a value yet.

The second alert proves the assignment has completed and we see "Jim" appear as you would expect.

The final example proves that if there's no reference to `foo` it will simply error, which also backs up the proof that our creation phase is working like we expect.



> 👍 ⠀We've just covered an extremely advanced of JavaScript in the first few minutes and you may not have noticed it, we've just covered the global execution context, hoisting, memory, if you can understand this then you'll have a rock solid base for all future JS code.


## Expanding upon our variable knowledge

Now we have an understanding of what happens when you're assigning a variable in JS, we can expand on it and get even more out of our advanced knowledge.

### `const` and `let` vs `var`

`var` is basically outdated JavaScript at this point, these days we use ES6 which introduced `const` and `let`. This allows us to write better code that expresses our intent properly, as well as removing some of the confusing things we saw previously with variables being `undefined` but not throwing an error if they get hoisted up.

If you're writing code today, don't use `var` unless you **really** know what you're doing and are purposefully abusing the hoisting and scope. You get around this by writing cleaner, easier to read code.

### const

`const` is constant **assigment**

We know from our examples before that assignment is when you're changing the value a variable has, `const` stops us from doing that. 

You might wonder "Why would you ever want to stop a variable from changing?!" but when you're writing complex code you can easily lose track of the values they have, especially when working with other people. Being able to lock a value and know that `const IMPORTANT_NUMBER = 5` won't randomly somehow change to 6 by other code is **very** good, it stops a lot of bugs before they even get to become a problem.

Take this code block for example:
```js
// your code
var importantNumber = 5;
// 1000 lines of code here...
importantNumber = 8;
// someone else's code


var importantNumber = 7;
importantNumber // 7
```
Wait, what? Why is `importantNumber` `7` now?! My code relied on it being `8`! All my math is broken! Someone got billed for £700 not £800! 🔥 😱 

You can see how easy it is to lose track of a single value, especially when it can be overriden entirely if you're using `var`.

But what if we used `const` instead?

```js
const importantNumber = 5
const importantNumber = 7 // Identifier 'importantNumber' has already been declared
```

It also protects us from the number being reassigned at all.

```js
const importantNumber = 5
importantNumber = 8 // TypeError: Assignment to constant variable.
importantNumber += 1; // TypeError Assignment to constant variable.
```

But what if you **do** want to reassign? In that case you'll want to use `let`. 

### let

`let` **can** be reassigned, so you should use it when you have a value you expect to change. It follows all the same rules as `const` scope wise, it can simply just be reassigned.

```js
let age = 0;

age = 7; // reassigns to 7
age += 1; // reassigns to age + 1
age // 8
```

However, similarly to `const` we can't **redeclare** when using `let`
```js
let age = 0;
let age = 100; // SyntaxError: Identifier 'age' has already been declared
```


### Hoisting and scope for `let` and `const`

Previously we saw that `var` was hoisted up and we could use reference `name` before it was declared in our code, however with `let` and `const` there's something slightly different, the **decleration** is still hoisted, but can't be accessed until the **assignment** has evaluated.

```js
alert(name); // ReferenceError: Cannot access 'name' before initialization

const name = "Taylor Swift"; // same error if using let
```

For the sake of keeping things simple, you can assume that when using `let` or `const` means your variable must be declared and assigned before you can use it, which is a good thing when it comes to writing clean code that has less bugs.



## Primitives


Primitive data structures are the main values you'll come across in most of your code, when you see a name pop up on the screen, that's a string. However, when you see a number..Well, that could be a string too..Or it could be a number, that entirely depends on how the code is written.

A classic problem in JavaScript is that it's dynamically **and** loosely typed, this means a single variable can go from a `String` to a `Number` to a `Boolean` at any time and there's nothing enforcing it to stick to a specific type.

Let's start with a classic problem, you may have even encountered it already if you've tried some basic math calculation.


```js
const input = prompt('what is your age?');
alert(`You entered a ${typeof input} of ${input} your age plus 10 is: ${input + 10}`);
```

In this example it will show an alert, you'll enter an age, a `Number`, right? - Well no. `prompt` accepts a string type input (what you type into), so whatever you type into the input will be a `String`, even if you enter `22`. That's why the outcome will be a number you don't expect, the `+` sign here is actually **concatenating a number onto a string** instead of adding 2 numbers. So an input of `8` will give you `"810"`, not `18`.


We can now start figuring out how to work with each of the primitives in JS, but first we'll need to know a few things.

- Primitives are **not** objects, they are a single value in memory `5` is `5` in memory, no matter where you use it.
- JavaScript automatically [coerces](https://developer.mozilla.org/en-US/docs/Glossary/Type_coercion) values to different types depending on the function/method being used.



## Boolean

Booleans are the representation of `true` or `false` and nothing else, you use a Boolean when you want a variable to hold a simple `ON/OFF` state, primarily you'll use this for comparisons or conditionals. There's not too much to talk about, a very basic example will give you all the info you'll need for now.

```js
let loading = true // boolean loading value - `let` because it may change to false when loading is finished
if (loading) { // conditional checking the boolean value
  alert('this page is loading!')
}
```


### Strings

Strings are quite simple, you've already seen them being used. The primary thing to understand about a string is that any string is **always** the same value in memory, e.g `"hello"` is **always** `"hello"` in memory, this is how JavaScript does comparisons with `===` equality *(more on this below)*

There's a few ways you can create strings:

```js
const band = "Fleetwood Mac" // string primitive
const songName = 'Dreams' // string primitive
const time = new String("4:17") // string Object
const fullTitle = `${band} - ${songName} - ${time}` // template literal

fullTitle // "Fleetwood Mac - Dreams - 4:17"
```

`band` and `songName` use the regular string primitive method of creating a string, you can use either method for creating strings, typically you'll use a style guide that will prefer one or the other. 

`time` is created using the `String` constructor. Typically you won't use this, but it's there if you really have to.

`fullTitle` is using a [template literal](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) - this is a great way to interpolate, concatenate and even multiline strings.


You'll want your code to provide the most **intent** it can, so you may be thinking "why not just always use a template literal?!" but when you're reading code you **expect** a template literal to include some form of concatenation or inerpolation as the example shows, so if a primitive string will do then you should use that instead. 

One major reason why the method for creating the `time` string isn't good is because you're now unable to do comparisons. 


```js
const time = "4:17"
const timeNewString = new String("4:17");
const timeString = String("4:17") // doesn't construct the String object, returns a string primitive

time === timeNewString // true
time === timeNewString // false
```
When using template literal or either of the string primitive methods they will all return a string primitive, you can compare those easily and get expected values.

```js
const band = "Radiohead"
const band2 = 'Radiohead'
const band3 = `Radiohead`

band === band2 // true
band2 === band3 // true
```

> The reason you can do `"hello".split()` or other methods is because of a feature called [autoboxing](https://stackoverflow.com/questions/17216847/does-javascript-autobox), this "wraps" the primitive value with an object (new String("hello")) that has the prototype, which contains the `split` method.

#### Numbers

A `Number` in JavaScript is a [floating-point number](https://www.youtube.com/watch/PZRI1IfStY0) and comes with all the fun annoyances that come with it, that means `5` is `5.0` but will display as `5`. 

There's also [BigInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt) available if you're working with **very** large numbers, however typically you'll just use `45.2` and not need a `BigInt` for most code.


Similarly to `new String` we can either create a number literal or a number object

```js
const num = 5; // 5
const num2 = Number(5); // 5
const num3 = new Number(5) // Number {5}

num === num3 // false
```

A common problem with numbers in JS would simply be doing any type of math that requires precision, due to floating points you're likely to run into this situation:

```js
const value = 0.1

const amount = 0.2 

const paymentRequired = value * amount;

paymentRequired; // 0.020000000000000004
```

So where did the that `4` come from at the end? [this video](https://www.youtube.com/watch/PZRI1IfStY0) explains why, this isn't *just* a JavaScript problem, it's in pretty much all languages when doing floating point calculations.

___

### Comparing strings and numbers

You may have noticed using `Number(5)` returns a number, so does it work on **any** value to create a number? The answer is **yes!** Well...Kind of..If it can.

```js
Number("5") // 5
Number("five") // NaN
```

> `NaN` means `Not a Number` - to sum this up quickly it is a "number that can't be parsed" check [the docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NaN) for more info.

The same thing happens for `String(5)`

```js
String(5) // "5"
```

This leads us to how JavaScript can compare strings and numbers, there are 2 ways of comparison you'll typically use, `==` or `===`. 

This is a confusing and long topic, the [JavaScript equity table](https://dorey.github.io/JavaScript-Equality-Table/) displays just what a mess this can be. Check [this blog post](https://www.freecodecamp.org/news/js-type-coercion-explained-27ba3d9a2839/) for loads of examples.

For 99.999% of your code you should use `===` for all comparisons, the only time you shouldn't use it is when you're purposefully trying to compare different types, even then you should just manually convert to the type you expect, handle the errors (if any) and then compare the 2 correct types. Life will be a lot simpler that way.



But since it's important to know what's happening we'll start with `==`.

### ==

`==` Will do the functions we saw before, using `String` and `Number` to convert the values on either side to check if there's a match, it gets very confusing when you're doing things like `[1] == 1` (which is `true`! 🥴), so we'll just stick to numbers and strings.

`==` is **loose** equality, where the equality isn't based on type, JavaScript will try to *implicitly coerce* both of the values until the values are **strictly** equal (`===`).

Implicit coerction basically means "keep changing the type to find one that can compare with the other value to be true".

There are only 3 ways JavaScript can convert values
- `String(value)`
- `Number(value)`
- `Boolean(value)`

In the case of comparing strings to numbers, we can refer to [the ECMA spec](http://www.ecma-international.org/ecma-262/5.1/#sec-11.9.3) if we want to understand it fully, however our example of `5 == "5"` is pretty simple thankfully.

```js
//If Type(x) is Number and Type(y) is String,
//return the result of the comparison x == ToNumber(y).

const x = 5;
const y = "5"
x == y // true
x === Number(y); // true
```


### ===

`===` Is a lot easier to understand. In our example of `5 == "5"` there is **type coercion** happening, in `===` no such thing happens, it's a comparison of `5` to `"5"` and that's it, no conversions.

```js
5 === "5"
```

A string of 5 is not **equal** to 5, in memory primatives are simply that, a value in memory. Your computer doesn't need to create a new `5` every time you want to use `5`, it's just `5`. The same is true for `"5"`, because these 2 primative values point towards different values in memory there's no way they can be equal values.



> It should be noted `===` is not as simple when discussing Objects or Arrays - they are compared by reference not by value, so `[1] === [1] // false` this will be expanded upon when we reach the array section, although similar to above the answer is simply that those are 2 different arrays in memory, so they don't point to the same array in memory, they just happen to be 2 arrays with the same value.

## `undefined` & `null` 

`undefined` is the representation of a value that does not exist yet. It is "nothing" and should be used when you're planning to have a value at some point, but it has not yet been assigned. You can either declare a variable on it's own `let value` or explicitly assign it `let value = undefined`. 

```js
let value; // undefined 
// some code..
value = 5;
```

`null` is similar to `undefined`, however `null` should be used to explicitly represent that the variable should have no value and points to no value.

```js
let value;
value = null; // specifically assigned null to say value points to nothing and is no longer undefined, but the value is nothing
```