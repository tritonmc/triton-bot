import crypto from 'crypto';

export default () => crypto.randomBytes(24).toString('hex');
