const db = require('../config/database');

exports.getConfig = (req, res) => {
  try {
    let config = db.prepare('SELECT * FROM site_config WHERE id = 1').get();
    if (!config) {
      db.prepare("INSERT INTO site_config (id) VALUES (1)").run();
      config = db.prepare('SELECT * FROM site_config WHERE id = 1').get();
    }
    res.json(config);
  } catch (e) { res.status(500).json({ message: 'Server error', error: e.message }); }
};

exports.updateConfig = (req, res) => {
  try {
    const { business_name, tagline, description, logo_url, primary_color, secondary_color, whatsapp, email, address, hero_title, hero_subtitle, about_text } = req.body;
    let config = db.prepare('SELECT * FROM site_config WHERE id = 1').get();
    if (!config) db.prepare("INSERT INTO site_config (id) VALUES (1)").run();

    db.prepare(`UPDATE site_config SET business_name=?, tagline=?, description=?, logo_url=?, primary_color=?, secondary_color=?, whatsapp=?, email=?, address=?, hero_title=?, hero_subtitle=?, about_text=?, updated_at=CURRENT_TIMESTAMP WHERE id=1`)
      .run(
        business_name || config?.business_name, tagline || config?.tagline, description !== undefined ? description : config?.description,
        logo_url !== undefined ? logo_url : config?.logo_url, primary_color || config?.primary_color, secondary_color || config?.secondary_color,
        whatsapp !== undefined ? whatsapp : config?.whatsapp, email !== undefined ? email : config?.email,
        address !== undefined ? address : config?.address, hero_title !== undefined ? hero_title : config?.hero_title,
        hero_subtitle !== undefined ? hero_subtitle : config?.hero_subtitle, about_text !== undefined ? about_text : config?.about_text
      );

    res.json(db.prepare('SELECT * FROM site_config WHERE id = 1').get());
  } catch (e) { res.status(500).json({ message: 'Server error', error: e.message }); }
};
