import React, { useState, useEffect, useMemo } from 'react';
import { Search, MapPin, TrendingUp, Filter, Award } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ShimmerGrid } from '../components/Shimmer';
import './MarketPrice.css';

const API_KEY = '579b464db66ec23bdd00000166a5f0b0a5a04ce0666fd3f49b1518ec';
const API_URL = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${API_KEY}&format=json&limit=1000`;

const MarketPrice = () => {
    const { t } = useTranslation();
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters state
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        state: '',
        district: '',
        commodity: '',
        priceRange: ''
    });

    // Unique values for dropdowns
    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [commodities, setCommodities] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            const result = await response.json();
            const records = result.records || [];

            setData(records);
            setFilteredData(records);

            setStates([...new Set(records.map(item => item.state))].sort());
            setDistricts([...new Set(records.map(item => item.district))].sort());
            setCommodities([...new Set(records.map(item => item.commodity))].sort());

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        applyFilters();
    }, [filters, searchQuery, data]);

    const applyFilters = () => {
        let result = data;

        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(item =>
                item.commodity.toLowerCase().includes(lowerQuery) ||
                item.market.toLowerCase().includes(lowerQuery)
            );
        }

        if (filters.state) {
            result = result.filter(item => item.state === filters.state);
        }
        if (filters.district) {
            result = result.filter(item => item.district === filters.district);
        }
        if (filters.commodity) {
            result = result.filter(item => item.commodity === filters.commodity);
        }

        // Determine active commodity for price filtering
        const uniqueCommoditiesSoFar = [...new Set(result.map(item => item.commodity))];
        const activeCommodityForPrice = filters.commodity || (uniqueCommoditiesSoFar.length === 1 ? uniqueCommoditiesSoFar[0] : null);

        if (filters.priceRange && activeCommodityForPrice) {
            result = result.filter(item => {
                const price = parseFloat(item.modal_price) || parseFloat(item.max_price);
                if (isNaN(price)) return true;

                switch (filters.priceRange) {
                    case 'below-2000': return price < 2000;
                    case '2000-5000': return price >= 2000 && price <= 5000;
                    case '5000-10000': return price > 5000 && price <= 10000;
                    case 'above-10000': return price > 10000;
                    default: return true;
                }
            });
        }

        setFilteredData(result);

        // Update dependent dropdowns based on selections
        if (filters.state) {
            const stateData = data.filter(item => item.state === filters.state);
            setDistricts([...new Set(stateData.map(item => item.district))].sort());
        } else {
            // Reset to all if no state selected
            setDistricts([...new Set(data.map(item => item.district))].sort());
        }
    };

    // Calculate best price insight when a commodity is selected or exactly one commodity is filtered by search
    const bestPriceInsight = useMemo(() => {
        // Find all unique commodities currently in the filtered data
        const uniqueFilteredCommodities = [...new Set(filteredData.map(item => item.commodity))];

        // Show insight if explicitly selected via dropdown OR if search narrowed it down to exactly 1 commodity
        const activeCommodity = filters.commodity || (uniqueFilteredCommodities.length === 1 ? uniqueFilteredCommodities[0] : null);

        // Only show insight if an active commodity is identified AND we have matching data
        if (!activeCommodity || filteredData.length === 0) return null;

        // Find the record with the maximum modal_price (or max_price if you prefer) for this commodity
        // across ALL data to truly find the best place, but we'll use the filtered data context
        // to respect state filters if they exist.

        let highestPriceRecord = filteredData[0];

        for (let i = 1; i < filteredData.length; i++) {
            // We use modal_price as the primary indicator for best selling price
            if (filteredData[i].max_price > highestPriceRecord.max_price) {
                highestPriceRecord = filteredData[i];
            }
        }

        return highestPriceRecord;
    }, [filters.commodity, filteredData]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value,
            // Reset dependent district if State changes
            ...(name === 'state' && { district: '' })
        }));
    };

    if (loading) {
        return (
            <div className="market-price-container">
                <div className="market-price-header">
                    <h2>{t('market.title')}</h2>
                    <div className="header-subtitle-wrapper">
                        <p>{t('market.loading')}</p>
                    </div>
                </div>
                <ShimmerGrid count={8} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="market-price-container error-container">
                <p>{t('market.error')}: {error}</p>
                <button onClick={fetchData} className="retry-btn">{t('market.retry')}</button>
            </div>
        );
    }

    return (
        <div className="market-price-page">
            <div className="market-price-hero">
                <div className="market-price-header">
                    <h2>{t('market.title')}</h2>
                    <div className="header-subtitle-wrapper">
                        <p>{t('market.subtitle')}</p>
                    </div>
                </div>

                <div className="filters-bar">
                    <div className="search-wrapper">
                        <Search className="search-icon" size={20} />
                        <input
                            type="text"
                            placeholder={t('market.searchPlaceholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                    </div>

                    <div className="dropdowns-wrapper">
                        <div className="select-wrapper">
                            <select id="commodity" name="commodity" value={filters.commodity} onChange={handleFilterChange}>
                                <option value="">{t('market.allCommodities')}</option>
                                {commodities.map(commodity => (
                                    <option key={commodity} value={commodity}>{commodity}</option>
                                ))}
                            </select>
                        </div>

                        <div className="select-wrapper">
                            <select id="state" name="state" value={filters.state} onChange={handleFilterChange}>
                                <option value="">{t('market.allStates')}</option>
                                {states.map(state => (
                                    <option key={state} value={state}>{state}</option>
                                ))}
                            </select>
                        </div>

                        <div className="select-wrapper">
                            <select id="district" name="district" value={filters.district} onChange={handleFilterChange} disabled={!filters.state && districts.length > 100}>
                                <option value="">{t('market.allDistricts')}</option>
                                {districts.map(district => (
                                    <option key={district} value={district}>{district}</option>
                                ))}
                            </select>
                        </div>

                        {(() => {
                            // Determine if Price Range filter should be visible
                            const uniqueFilteredCommoditiesForPrice = [...new Set(filteredData.map(item => item.commodity))];
                            const showPriceFilter = filters.commodity || uniqueFilteredCommoditiesForPrice.length === 1;

                            return (
                                <>
                                    {showPriceFilter && (
                                        <div className="select-wrapper slide-in">
                                            <select
                                                id="priceRange"
                                                name="priceRange"
                                                value={filters.priceRange}
                                                onChange={(e) => setFilters(prev => ({ ...prev, priceRange: e.target.value }))}
                                            >
                                                <option value="">{t('market.allPrices')}</option>
                                                <option value="below-2000">{t('market.below2k')}</option>
                                                <option value="2000-5000">{t('market.range2k5k')}</option>
                                                <option value="5000-10000">{t('market.range5k10k')}</option>
                                                <option value="above-10000">{t('market.above10k')}</option>
                                            </select>
                                        </div>
                                    )}
                                </>
                            );
                        })()}
                    </div>
                </div>
            </div>

            <div className="market-price-container">

                {bestPriceInsight && (
                    <div className="best-price-insight-card">
                        <div className="insight-icon-wrapper">
                            <Award size={28} className="insight-icon" />
                        </div>
                        <div className="insight-content">
                            <h4 className="insight-title">{t('market.highestPrice')} {bestPriceInsight.commodity}</h4>
                            <p className="insight-location">
                                {t('market.foundIn')} <strong>{bestPriceInsight.market}</strong> ({bestPriceInsight.district}, {bestPriceInsight.state})
                            </p>
                        </div>
                        <div className="insight-value">
                            <span className="insight-price">₹{bestPriceInsight.max_price}</span>
                            <span className="insight-label">{t('market.maxPrice')}</span>
                        </div>
                    </div>
                )}

                {filteredData.length === 0 ? (
                    <div className="no-data">{t('market.noRecords')}</div>
                ) : (
                    <div className="cards-grid">
                        {filteredData.map((item, index) => (
                            <div className="price-card" key={index}>
                                <div className="card-header">
                                    <h3 className="commodity-name">{item.commodity}</h3>
                                    <span className="market-badge">{item.market}</span>
                                </div>

                                <div className="card-subtext">
                                    <p>{t('market.variety')}: {item.variety}</p>
                                    <p>{t('market.grade')}: {item.grade}</p>
                                </div>

                                <div className="location-info">
                                    <MapPin size={16} />
                                    <span>{item.district}, {item.state}</span>
                                </div>

                                <div className="price-range">
                                    <div className="price-box">
                                        <span className="price-label">{t('market.minPriceLabel')}</span>
                                        <span className="price-value min-val">₹{item.min_price}</span>
                                    </div>
                                    <div className="price-box">
                                        <span className="price-label">{t('market.maxPriceLabel')}</span>
                                        <span className="price-value max-val">₹{item.max_price}</span>
                                    </div>
                                </div>

                                <div className="modal-price-box">
                                    <TrendingUp size={18} className="trend-icon" />
                                    <span className="modal-label">{t('market.modalPrice')}</span>
                                    <span className="modal-value">₹{item.modal_price}</span>
                                </div>

                                <div className="card-footer">
                                    <span className="source-badge">{t('market.source')}</span>
                                    <span>{t('market.lastUpdate')}: {item.arrival_date}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="summary-footer">
                    {t('market.showingRecords')} {filteredData.length} {t('market.records')}
                </div>
            </div>
        </div>
    );
};

export default MarketPrice;
