const getRootUrl = () => process.env.NODE_ENV === 'development' ? '/' : '/ColdEscape/';

export default getRootUrl;
