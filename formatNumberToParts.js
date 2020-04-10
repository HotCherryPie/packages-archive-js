// Fix for IE parseFloat(0.55).toFixed(0) = 0;
function toFixedPolyfill(value, fractionLength) {
  return Math.round(value * (10 ** fractionLength))
      .toString()
      .replace(/(?=(?:\d{2})(?!\d))/, '.');
}

function formatNumberToParts(value, fractionLength = 0) {
  const pureValue = value.toString().replace(/[^0-9+\-Ee.]/g, '');
  const number = !Number.isFinite(+pureValue) ? 0 : +pureValue;

  const sign = (number === 0)
      ? Object.is(number, -0) ? '-' : '+'
      : (number > 0) ? '+' : '-';

  const [integer, fraction] = toFixedPolyfill(Math.abs(number), fractionLength).split('.');

  return { sign, integer, fraction };
}