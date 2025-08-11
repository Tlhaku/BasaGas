document.getElementById('orderForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const cylinder = document.getElementById('cylinder').value;
  const responseElement = document.getElementById('response');
  responseElement.textContent = 'Submitting order...';

  try {
    const res = await fetch('/api/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, cylinder })
    });
    const data = await res.json();
    responseElement.textContent = data.message;
  } catch (err) {
    responseElement.textContent = 'Error placing order';
  }
});
