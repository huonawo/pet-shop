const fs = require('fs');

const files = [
  'src/views/HistoryView.vue',
  'src/views/LoginView.vue',
  'src/views/CouponsView.vue',
  'src/views/OrderDetailView.vue'
];

files.forEach(file => {
  try {
    const content = fs.readFileSync(file, { encoding: 'latin1' });
    const fixed = Buffer.from(content, 'latin1').toString('utf8');
    fs.writeFileSync(file, fixed, 'utf8');
    console.log('Fixed:', file);
  } catch (e) {
    console.error('Error:', file, e.message);
  }
});