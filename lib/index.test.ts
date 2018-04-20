import test from 'ava';
import diff from './';

test('empty', t => {
  t.deepEqual(diff([], []), []);
});

test('"a" vs "b"', t => {
  t.deepEqual(diff(['a'], ['b']), [{ type: 'removed', value: 'a' }, { type: 'added', value: 'b' }]);
});

test('"a" vs "a"', t => {
  t.deepEqual(diff(['a'], ['a']), [{ type: 'common', value: 'a' }]);
});

test('"a" vs ""', t => {
  t.deepEqual(diff(['a'], []), [{ type: 'removed', value: 'a' }]);
});

test('"" vs "a"', t => {
  t.deepEqual(diff([], ['a']), [{ type: 'added', value: 'a' }]);
});

test('"a" vs "a, b"', t => {
  t.deepEqual(diff(['a'], ['a', 'b']), [{ type: 'common', value: 'a' }, { type: 'added', value: 'b' }]);
});

test('"strength" vs "string"', t => {
  t.deepEqual(diff(Array.from('strength'), Array.from('string')), [
    { type: 'common', value: 's' },
    { type: 'common', value: 't' },
    { type: 'common', value: 'r' },
    { type: 'removed', value: 'e' },
    { type: 'added', value: 'i' },
    { type: 'common', value: 'n' },
    { type: 'common', value: 'g' },
    { type: 'removed', value: 't' },
    { type: 'removed', value: 'h' },
  ]);
});

test('"strength" vs ""', t => {
  t.deepEqual(diff(Array.from('strength'), Array.from('')), [
    { type: 'removed', value: 's' },
    { type: 'removed', value: 't' },
    { type: 'removed', value: 'r' },
    { type: 'removed', value: 'e' },
    { type: 'removed', value: 'n' },
    { type: 'removed', value: 'g' },
    { type: 'removed', value: 't' },
    { type: 'removed', value: 'h' },
  ]);
});

test('"" vs "strength"', t => {
  t.deepEqual(diff(Array.from(''), Array.from('strength')), [
    { type: 'added', value: 's' },
    { type: 'added', value: 't' },
    { type: 'added', value: 'r' },
    { type: 'added', value: 'e' },
    { type: 'added', value: 'n' },
    { type: 'added', value: 'g' },
    { type: 'added', value: 't' },
    { type: 'added', value: 'h' },
  ]);
});

test('"abc", "c" vs "abc", "bcd", "c"', t => {
  t.deepEqual(diff(['abc', 'c'], ['abc', 'bcd', 'c']), [
    { type: 'common', value: 'abc' },
    { type: 'added', value: 'bcd' },
    { type: 'common', value: 'c' },
  ]);
});
