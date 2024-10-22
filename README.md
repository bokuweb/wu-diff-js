# wu-diff-js

Compute differences between two slices using wu(the O(NP)) algorithm.

[![CircleCI](https://circleci.com/gh/bokuweb/wu-diff-js.svg?style=svg)](https://circleci.com/gh/bokuweb/wu-diff-js)

## Example

```javascript
import diff from 'wu-diff-js';

diff(Array.from('strength'), Array.from('string'));
/*
  [
    { type: 'common', value: ['s', 's'] },
    { type: 'common', value: ['t', 't'] },
    { type: 'common', value: ['r', 'r'] },
    { type: 'removed', value: 'e' },
    { type: 'added', value: 'i' },
    { type: 'common', value: ['n', 'n'] },
    { type: 'common', value: ['g', 'g'] },
    { type: 'removed', value: 't' },
    { type: 'removed', value: 'h' },
*/
```

### Usage

#### with Node.js

```
npm i wu-diff-js
```

### with deno

```
import diff from 'https://denopkg.com/bokuweb/wu-diff-js@0.1.7/lib/index.ts';
```

## LICENSE

The MIT License (MIT)

Copyright (c) 2018 @bokuweb

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
