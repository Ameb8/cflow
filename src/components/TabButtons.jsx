export function TabButtons({ selectedTab, setSelectedTab }) {
    return (
        <div className="tabs">
            {[0, 1, 2, 3].map((index) => (
                <button
                    key={index}
                    className={selectedTab === index ? 'tab-selected' : 'tab'}
                    onClick={() => setSelectedTab(index)}
                >
                    Tab {index + 1}
                </button>
            ))}
        </div>
    );
}
