const formatDate = (date: string) => {
  const [y, m, d] = date.split('-');
  return `${d}.${m}.${y}`;
};

export { formatDate };
