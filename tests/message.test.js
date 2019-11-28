const assert = require('assert');

describe('Message', function () {
    describe('#indexOf()', function () {
        it('PASS should equal 1', function () {
            let test = 1;
            assert.equal(test, 1)

        });
        it('PASS should not equal 1', function () {
            let test = 1;
            assert.notEqual(test, 2)
        });
    });
});