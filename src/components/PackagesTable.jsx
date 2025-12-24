import { useState, useEffect } from 'react';

function PackagesTable() {
  const [packages, setPackages] = useState([]);
  const [filteredPackages, setFilteredPackages] = useState([]);
  const [sortBy, setSortBy] = useState('price');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterNetwork, setFilterNetwork] = useState('');
  const [filterType, setFilterType] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPackages();
  }, [sortBy, sortOrder, filterNetwork, filterType]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        sort_by: sortBy,
        order: sortOrder,
        ...(filterNetwork && { network: filterNetwork }),
        ...(filterType && { type: filterType })
      });

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/airtime-data/packages?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setPackages(data.packages);
      setFilteredPackages(data.packages);
    } catch (error) {
      console.error('Fetch packages error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const formatData = (data) => {
    if (!data) return '-';
    return data;
  };

  const formatMinutes = (minutes) => {
    if (minutes === null) return 'Unlimited';
    return `${minutes} min`;
  };

  const formatPrice = (price, discount) => {
    const discountedPrice = discount > 0 ? price * (1 - discount / 100) : price;
    return `R${discountedPrice.toFixed(2)}${discount > 0 ? ` (${discount}% off)` : ''}`;
  };

  const networks = [...new Set(packages.map(p => p.network))];
  const types = [...new Set(packages.map(p => p.type))];

  return (
    <div className="packages-table-container">
      <h3>Network Packages</h3>

      <div className="filters">
        <select value={filterNetwork} onChange={(e) => setFilterNetwork(e.target.value)}>
          <option value="">All Networks</option>
          {networks.map(network => (
            <option key={network} value={network}>{network}</option>
          ))}
        </select>

        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="">All Types</option>
          <option value="data">Data Only</option>
          <option value="airtime">Airtime Only</option>
          <option value="combined">Combined</option>
        </select>
      </div>

      {loading ? (
        <p>Loading packages...</p>
      ) : (
        <div className="table-responsive">
          <table className="packages-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('network')} style={{cursor: 'pointer'}}>
                  Network {getSortIcon('network')}
                </th>
                <th>Package Name</th>
                <th>Type</th>
                <th onClick={() => handleSort('data')} style={{cursor: 'pointer'}}>
                  Data {getSortIcon('data')}
                </th>
                <th onClick={() => handleSort('minutes')} style={{cursor: 'pointer'}}>
                  Minutes {getSortIcon('minutes')}
                </th>
                <th onClick={() => handleSort('price')} style={{cursor: 'pointer'}}>
                  Price {getSortIcon('price')}
                </th>
                <th onClick={() => handleSort('validity_days')} style={{cursor: 'pointer'}}>
                  Validity {getSortIcon('validity_days')}
                </th>
                <th>Region</th>
                <th>Add-ons</th>
              </tr>
            </thead>
            <tbody>
              {filteredPackages.map((pkg, index) => (
                <tr key={`${pkg.type}-${pkg.id}`}>
                  <td>{pkg.network}</td>
                  <td>{pkg.name}</td>
                  <td>{pkg.type.charAt(0).toUpperCase() + pkg.type.slice(1)}</td>
                  <td>{formatData(pkg.data)}</td>
                  <td>{formatMinutes(pkg.minutes)}</td>
                  <td>{formatPrice(pkg.price, pkg.discount_percentage)}</td>
                  <td>{pkg.validity_days} days</td>
                  <td>{pkg.regional_availability}</td>
                  <td>{pkg.add_ons || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}

export default PackagesTable;