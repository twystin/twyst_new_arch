var _ = require('lodash');

var obj = {
	foo: {
		bar: {
			test: 'abc'
		}
	}
}

console.log(_.get(obj, 'foo.bar.test'));
console.log(obj.foo.bar.test);
console.log(_.get(obj, 'foo.baz.test'));
console.log(_.get(obj, 'foo.bar.baz'));