/** CRA sets postcss `config: false`; `mode: 'file'` loads ./postcss.config.js (Tailwind). */
module.exports = {
  style: {
    postcss: {
      mode: 'file',
    },
  },
};
