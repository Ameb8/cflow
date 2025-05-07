import './TabButtons.css';

export function TabButtons({ selectedTab, setSelectedTab }) {
    const tabNames = ['Base', 'O1', 'O2', 'O3']

    return (
        <div className="tabs">
            <label className="tab-label">Optimization Level:</label>
            {tabNames.map((name, index) => (
                <button
                    key={index}
                    className={selectedTab === index ? 'tab-selected' : 'tab'}
                    onClick={() => setSelectedTab(index)}
                >
                    {name}
                </button>
            ))}
        </div>
    );
}
