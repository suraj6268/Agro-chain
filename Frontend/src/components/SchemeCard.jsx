import { useTranslation } from 'react-i18next';
import './SchemeCard.css';

const SchemeCard = ({ scheme }) => {
    const { t } = useTranslation();
    const schemeId = scheme._id || scheme.id;

    return (
        <div className="scheme-card">
            <div className="scheme-card-header">
                <span className="scheme-category-badge">
                    {scheme.category}
                </span>
                {scheme.isActive === false && (
                    <span className="inactive-badge">{t('schemes.inactive')}</span>
                )}
            </div>

            <h3 className="scheme-title">{scheme.name}</h3>
            <p className="scheme-description">{scheme.shortDescription}</p>

            <div className="scheme-benefits">
                <div className="benefit-item">
                    <span className="benefit-icon">💰</span>
                    <span className="benefit-text">{scheme.benefits || scheme.benefit}</span>
                </div>
            </div>

            <div className="scheme-actions">
                <a
                    href={`/scheme/${schemeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-details"
                >
                    {t('schemes.seeMore')}
                    <span className="arrow">→</span>
                </a>

                <a
                    href={scheme.officialLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-official"
                >
                    {t('schemes.officialWeb')}
                    <span className="external-icon">↗</span>
                </a>
            </div>
        </div>
    );
};

export default SchemeCard;
