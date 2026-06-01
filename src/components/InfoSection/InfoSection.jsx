import "./InfoSection.css";

function InfoSection() {
    return (
        <div className="info">
            <h2>Why ReBite?</h2>

            <div className="info-cards">
                <div className="card">
                    <h3>Reduce Waste</h3>
                    <p>Help restaurants share excess food instead of throwing it away.</p>
                </div>

                <div className="card">
                    <h3>Support Communities</h3>
                    <p>Provide meals to charities and people in need.</p>
                </div>

                <div className="card">
                    <h3>Easy Connection</h3>
                    <p>Simple platform connecting donors and receivers.</p>
                </div>
            </div>
        </div>
    );
}

export default InfoSection;