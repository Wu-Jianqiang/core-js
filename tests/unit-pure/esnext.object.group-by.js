import { createIterable } from '../helpers/helpers';
import groupBy from 'core-js-pure/actual/object/group-by';
import getPrototypeOf from 'core-js-pure/es/object/get-prototype-of';
import entries from 'core-js-pure/es/object/entries';

QUnit.test('Object.groupBy', assert => {
  assert.isFunction(groupBy);
  assert.arity(groupBy, 2);
  assert.name(groupBy, 'groupBy');

  assert.same(getPrototypeOf(groupBy([], it => it)), null);

  assert.deepEqual(entries(groupBy([], it => it)), []);
  assert.deepEqual(entries(groupBy([1, 2], it => it ** 2)), [['1', [1]], ['4', [2]]]);
  assert.deepEqual(entries(groupBy([1, 2, 1], it => it ** 2)), [['1', [1, 1]], ['4', [2]]]);
  assert.deepEqual(entries(groupBy(createIterable([1, 2]), it => it ** 2)), [['1', [1]], ['4', [2]]]);

  const element = {};
  groupBy([element], function (it, i) {
    assert.same(arguments.length, 2);
    assert.same(it, element);
    assert.same(i, 0);
  });
});
