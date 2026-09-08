const router = require('express').Router();
const slaService = require('../services/slaService');
const requestForwardingService = require('../services/requestForwardingService');

router.get('/sla-check', async (req, res) => {
  if (req.headers['x-cron-secret'] !== process.env.CRON_SECRET) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  await slaService.checkAndFlagRequests();
  res.status(200).json({ success: true });
});

router.get('/auto-forward', async (req, res) => {
  if (req.headers['x-cron-secret'] !== process.env.CRON_SECRET) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  await requestForwardingService.checkAndFlagRequests();
  res.status(200).json({ success: true });
});

module.exports = router;