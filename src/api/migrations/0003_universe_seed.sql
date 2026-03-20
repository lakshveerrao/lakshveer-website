-- Universe V2 Seed Data
-- Converted from existing universe-data.ts
-- All nodes marked as 'verified' since they are from the original curated dataset

-- ============================================
-- CLUSTERS
-- ============================================
INSERT INTO universe_clusters (id, label, description, color, icon, level, momentum, growth_rate, core_skills) VALUES
('cluster-hardware', 'Hardware Engineering', 'Electronics, circuits, motors, sensors - the foundation', '#10b981', '🔧', 5, 85, 4.2, '["electronics", "arduino", "esp32"]'),
('cluster-robotics', 'Robotics & Automation', 'From simple motors to autonomous navigation', '#8b5cf6', '🤖', 4, 75, 3.1, '["robotics", "cpp", "electronics"]'),
('cluster-ai-vision', 'AI & Computer Vision', 'Machine learning, object detection, smart systems', '#3b82f6', '🧠', 3, 70, 5.8, '["python", "computer-vision", "machine-learning"]'),
('cluster-fabrication', '3D Printing & Fabrication', 'Physical prototyping and manufacturing', '#f59e0b', '🖨️', 4, 65, 2.5, '["3d-printing", "cad-design"]'),
('cluster-entrepreneurship', 'Entrepreneurship', 'Business, sales, product thinking', '#ec4899', '🚀', 4, 90, 2.0, '["entrepreneurship", "public-speaking"]'),
('cluster-aerial', 'Aerial Systems', 'Drones, FPV, flight control', '#06b6d4', '✈️', 2, 40, 1.5, '["drone-tech", "electronics"]');

-- ============================================
-- NODES - Core
-- ============================================
INSERT INTO universe_nodes (id, label, type, description, cluster_id, growth_weight, impact_score, momentum, verification_status, timestamp, year, meta, source) VALUES
('lakshveer', 'Lakshveer', 'person', '8-year-old Hardware + AI Systems Builder from Hyderabad. Building since age 4.', NULL, 100, 100, 100, 'verified', '2018-01', 2018, '{"age": 8, "startedAge": 4, "location": "Hyderabad, India"}', 'manual'),
('capt-venkat', 'Capt. Venkat', 'person', 'Father & Co-Founder. The backbone of Lakshveer''s journey.', NULL, 90, 95, 90, 'verified', '2018-01', 2018, '{"role": "Father & Co-Founder", "handle": "@CaptVenk"}', 'manual');

-- ============================================
-- NODES - Products
-- ============================================
INSERT INTO universe_nodes (id, label, type, description, url, cluster_id, growth_weight, impact_score, momentum, verification_status, status, timestamp, year, meta, source) VALUES
('circuitheroes', 'CircuitHeroes', 'project', 'Circuit-building trading card game. 300+ decks sold. Trademark registered.', 'https://circuitheroes.com', 'cluster-entrepreneurship', 85, 90, 85, 'verified', 'active', '2024-10', 2024, '{"sales": "300+", "trademark": true}', 'manual'),
('chhotacreator', 'ChhotaCreator', 'project', 'Peer-learning platform for hands-on learning.', 'https://chhotacreator.com', 'cluster-entrepreneurship', 75, 80, 75, 'verified', 'active', '2024-11', 2024, '{}', 'manual'),
('motionx', 'MotionX', 'project', 'Full-body motion-control gaming system. Built at RunTogether Hackathon.', 'https://motionx.runable.site/', 'cluster-ai-vision', 70, 75, 80, 'verified', 'active', '2026-01', 2026, '{}', 'manual'),
('hardvare', 'Hardvare', 'project', 'Hardware execution platform preventing unsafe wiring and invalid logic states.', NULL, 'cluster-hardware', 65, 70, 75, 'verified', 'active', '2026-02', 2026, '{}', 'manual'),
('diy-ebook', 'DIY eBook', 'project', 'The Kids Book of Creative Ideas. 100+ sales.', 'https://chhotacreator.com', 'cluster-entrepreneurship', 60, 65, 55, 'verified', 'completed', '2024-09', 2024, '{"sales": "100+"}', 'manual');

-- ============================================
-- NODES - Projects/Systems
-- ============================================
INSERT INTO universe_nodes (id, label, type, description, cluster_id, growth_weight, impact_score, momentum, verification_status, status, timestamp, year, source) VALUES
('kyabol', 'Kyabol', 'project', 'AI-powered conversational system built for Gemini 3 Hackathon.', 'cluster-ai-vision', 55, 60, 70, 'verified', 'completed', '2026-02', 2026, 'manual'),
('drishtikon-yantra', 'Drishtikon Yantra', 'project', 'Vision-based assistive device. Special Mention at Vedanta × Param Makeathon.', 'cluster-ai-vision', 60, 70, 75, 'verified', 'completed', '2026-01', 2026, 'manual'),
('line-robot', 'Line-Following Maze Robot', 'project', 'Autonomous navigation robot with sensor array for maze solving.', 'cluster-robotics', 50, 55, 60, 'verified', 'completed', '2025-11', 2025, 'manual'),
('grant-agent', 'Autonomous Grant Agent', 'project', 'AI agent sourcing and filing global grants autonomously using OpenClaw.', 'cluster-ai-vision', 45, 50, 55, 'verified', 'completed', '2026-02', 2026, 'manual'),
('obstacle-car', 'Obstacle Avoiding Car', 'project', 'Arduino-based car with 4 ultrasonic sensors for autonomous navigation.', 'cluster-robotics', 40, 45, 50, 'verified', 'completed', '2025-02', 2025, 'manual'),
('hydration-assistant', 'Hydration Assistant', 'project', 'Built at Hardware Hackathon 1.0 using Glyph board + sensor.', 'cluster-hardware', 45, 50, 55, 'verified', 'completed', '2025-07', 2025, 'manual'),
('electric-skateboard', 'Electric Skateboard', 'project', 'DC 775 Motor powered personal transport.', 'cluster-hardware', 35, 40, 35, 'verified', 'completed', '2024-06', 2024, 'manual'),
('hovercraft', 'DIY Hovercraft', 'project', 'CPU Fan powered hovercraft.', 'cluster-hardware', 30, 35, 30, 'verified', 'completed', '2023-12', 2023, 'manual'),
('self-driving-car', 'Self-Driving Car', 'project', 'Built with Witblox for autonomous navigation.', 'cluster-robotics', 35, 40, 35, 'verified', 'completed', '2023-12', 2023, 'manual'),
('robotic-table', 'Robotic Table', 'project', 'BO Motor powered moving table.', 'cluster-robotics', 25, 30, 25, 'verified', 'completed', '2023-06', 2023, 'manual'),
('first-dc-fan', 'First DC Motor Fan', 'project', 'The first documented build - where it all began.', 'cluster-hardware', 40, 50, 40, 'verified', 'completed', '2022-08', 2022, 'manual');

-- ============================================
-- NODES - Skills
-- ============================================
INSERT INTO universe_nodes (id, label, type, description, cluster_id, growth_weight, impact_score, momentum, verification_status, source) VALUES
('python', 'Python', 'skill', 'Primary programming language for AI/ML and automation.', 'cluster-ai-vision', 70, 80, 75, 'verified', 'manual'),
('cpp', 'C++', 'skill', 'For embedded systems and Arduino programming.', 'cluster-hardware', 60, 65, 60, 'verified', 'manual'),
('3d-printing', '3D Printing', 'skill', 'Creating physical parts with Prusa and Bambu Lab printers.', 'cluster-fabrication', 65, 70, 65, 'verified', 'manual'),
('electronics', 'Electronics', 'skill', 'Circuit design, soldering, sensor integration.', 'cluster-hardware', 75, 85, 80, 'verified', 'manual'),
('robotics', 'Robotics', 'skill', 'Building autonomous and controlled robots.', 'cluster-robotics', 70, 75, 70, 'verified', 'manual'),
('computer-vision', 'Computer Vision', 'skill', 'OpenCV, MediaPipe, object detection and tracking.', 'cluster-ai-vision', 55, 60, 65, 'verified', 'manual'),
('machine-learning', 'Machine Learning', 'skill', 'TensorFlow, PyTorch, TinyML for edge devices.', 'cluster-ai-vision', 50, 55, 60, 'verified', 'manual'),
('cad-design', 'CAD Design', 'skill', 'Fusion 360 for 3D modeling and design.', 'cluster-fabrication', 45, 50, 45, 'verified', 'manual'),
('public-speaking', 'Public Speaking', 'skill', 'Pitching, panels, demos to diverse audiences.', 'cluster-entrepreneurship', 55, 60, 65, 'verified', 'manual'),
('entrepreneurship', 'Entrepreneurship', 'skill', 'Product thinking, sales, trademark registration.', 'cluster-entrepreneurship', 60, 70, 75, 'verified', 'manual'),
('drone-tech', 'Drone Technology', 'skill', 'Building and flying drones, FPV systems.', 'cluster-aerial', 45, 40, 35, 'verified', 'manual'),
('iot', 'IoT', 'skill', 'Connected devices, sensors, automation.', 'cluster-hardware', 50, 55, 50, 'verified', 'manual');

-- ============================================
-- NODES - Tools
-- ============================================
INSERT INTO universe_nodes (id, label, type, description, cluster_id, growth_weight, impact_score, verification_status, source) VALUES
('raspberry-pi', 'Raspberry Pi', 'technology', 'Single-board computer for projects.', 'cluster-hardware', 60, 60, 'verified', 'manual'),
('arduino', 'Arduino', 'technology', 'Microcontroller platform for electronics.', 'cluster-hardware', 65, 70, 'verified', 'manual'),
('esp32', 'ESP32', 'technology', 'WiFi/Bluetooth microcontroller.', 'cluster-hardware', 55, 55, 'verified', 'manual'),
('bbc-microbit', 'BBC Micro:bit', 'technology', 'Educational microcontroller.', 'cluster-hardware', 40, 40, 'verified', 'manual'),
('prusa-printer', 'Prusa 3D Printer', 'tool', 'High-quality FDM 3D printer.', 'cluster-fabrication', 45, 45, 'verified', 'manual'),
('bambu-lab', 'Bambu Lab Printer', 'tool', 'Fast, reliable 3D printing.', 'cluster-fabrication', 45, 45, 'verified', 'manual'),
('fusion360', 'Fusion 360', 'tool', 'CAD software for 3D design.', 'cluster-fabrication', 40, 40, 'verified', 'manual'),
('tensorflow', 'TensorFlow', 'technology', 'ML framework for AI projects.', 'cluster-ai-vision', 45, 50, 'verified', 'manual'),
('opencv', 'OpenCV', 'technology', 'Computer vision library.', 'cluster-ai-vision', 45, 50, 'verified', 'manual'),
('mediapipe', 'MediaPipe', 'technology', 'ML solutions for vision tasks.', 'cluster-ai-vision', 40, 45, 'verified', 'manual');

-- ============================================
-- NODES - People/Organizations
-- ============================================
INSERT INTO universe_nodes (id, label, type, description, url, growth_weight, impact_score, verification_status, meta, source) VALUES
('lion-circuits', 'Lion Circuits', 'organization', 'PCB manufacturing and hackathon sponsor.', 'https://lioncircuits.com', 70, 75, 'verified', '{"role": "Sponsor"}', 'manual'),
('malpani-ventures', 'Malpani Ventures', 'organization', '₹1,00,000 grant provider.', NULL, 80, 85, 'verified', '{"grant": 100000}', 'manual'),
('param-foundation', 'Param Foundation', 'organization', 'Makeathon organizer.', NULL, 65, 70, 'verified', '{}', 'manual'),
('the-residency', 'The Residency', 'organization', 'Delta-2 Cohort - Laksh was youngest founder.', NULL, 70, 75, 'verified', '{}', 'manual'),
('south-park-commons', 'South Park Commons', 'organization', 'SF-based community for builders.', NULL, 60, 65, 'verified', '{}', 'manual'),
('robu', 'Robu.in', 'organization', 'Electronics components supplier.', 'https://robu.in', 55, 60, 'verified', '{}', 'manual'),
('aerolyte', 'Aerolyte', 'organization', 'Drone training organization.', NULL, 50, 55, 'verified', '{}', 'manual');

-- ============================================
-- NODES - Events/Achievements
-- ============================================
INSERT INTO universe_nodes (id, label, type, description, growth_weight, impact_score, verification_status, timestamp, year, source) VALUES
('gemini-hackathon', 'Gemini 3 Hackathon', 'event', 'Cerebral Valley × Google DeepMind hackathon in San Francisco.', 75, 85, 'verified', '2026-02', 2026, 'manual'),
('vedanta-makeathon', 'Vedanta × Param Makeathon', 'event', 'Won Youngest Innovator & Special Mention.', 70, 80, 'verified', '2026-01', 2026, 'manual'),
('hardware-hackathon-2', 'Hardware Hackathon 2.0', 'event', 'Top-5 Finalist as youngest participant.', 65, 70, 'verified', '2025-11', 2025, 'manual'),
('hardware-hackathon-1', 'Hardware Hackathon 1.0', 'event', 'Built Hydration Assistant with Glyph board.', 60, 65, 'verified', '2025-07', 2025, 'manual'),
('residency-delta2', 'The Residency Delta-2', 'event', 'Youngest founder in USA program.', 70, 75, 'verified', '2025-10', 2025, 'manual'),
('malpani-grant', 'Malpani Grant', 'award', '₹1,00,000 grant from Malpani Ventures.', 80, 85, 'verified', '2026-01', 2026, 'manual'),
('trademark', 'Circuit Heroes Trademark', 'award', 'Youngest IP holder for card game in India.', 65, 70, 'verified', '2025-01', 2025, 'manual'),
('isro-demo', 'ISRO Chief Demo', 'event', 'Demonstrated projects to Dr. Aniruddha.', 60, 70, 'verified', '2026-02', 2026, 'manual');

-- ============================================
-- EDGES - Core Relationships
-- ============================================
INSERT INTO universe_edges (id, source_id, target_id, type, label, weight, verification_status, source) VALUES
('e-laksh-venkat', 'lakshveer', 'capt-venkat', 'SUPPORTED_BY', 'Father & Co-Founder', 100, 'verified', 'manual'),
('e-laksh-circuitheroes', 'lakshveer', 'circuitheroes', 'BUILT_WITH', 'Created', 90, 'verified', 'manual'),
('e-laksh-chhotacreator', 'lakshveer', 'chhotacreator', 'BUILT_WITH', 'Created', 85, 'verified', 'manual'),
('e-laksh-motionx', 'lakshveer', 'motionx', 'BUILT_WITH', 'Created', 80, 'verified', 'manual'),
('e-laksh-hardvare', 'lakshveer', 'hardvare', 'BUILT_WITH', 'Building', 75, 'verified', 'manual');

-- ============================================
-- EDGES - Evolution (Project Growth)
-- ============================================
INSERT INTO universe_edges (id, source_id, target_id, type, label, weight, verification_status, source) VALUES
('e-ev-fan-hover', 'first-dc-fan', 'hovercraft', 'EVOLVED_INTO', 'Motor skills evolved', 60, 'verified', 'manual'),
('e-ev-hover-sdcar', 'hovercraft', 'self-driving-car', 'EVOLVED_INTO', 'Added navigation', 70, 'verified', 'manual'),
('e-ev-sdcar-obstacle', 'self-driving-car', 'obstacle-car', 'EVOLVED_INTO', 'Added sensors', 75, 'verified', 'manual'),
('e-ev-obstacle-line', 'obstacle-car', 'line-robot', 'EVOLVED_INTO', 'Advanced navigation', 80, 'verified', 'manual'),
('e-ev-line-drish', 'line-robot', 'drishtikon-yantra', 'EVOLVED_INTO', 'Added vision', 85, 'verified', 'manual');

-- ============================================
-- EDGES - Cross Pollination
-- ============================================
INSERT INTO universe_edges (id, source_id, target_id, type, label, weight, verification_status, source) VALUES
('e-cp-circuit-chhota', 'circuitheroes', 'chhotacreator', 'CROSS_POLLINATED', 'Teaching methodology transfer', 85, 'verified', 'manual'),
('e-cp-opencv-motion', 'opencv', 'motionx', 'CROSS_POLLINATED', 'Vision to tracking', 88, 'verified', 'manual'),
('e-cp-sdcar-drish', 'self-driving-car', 'drishtikon-yantra', 'CROSS_POLLINATED', 'Navigation to assistive', 90, 'verified', 'manual'),
('e-cp-hydra-drish', 'hydration-assistant', 'drishtikon-yantra', 'CROSS_POLLINATED', 'Assistive tech pattern', 70, 'verified', 'manual');

-- ============================================
-- EDGES - Skills/Tools Usage
-- ============================================
INSERT INTO universe_edges (id, source_id, target_id, type, label, weight, verification_status, source) VALUES
('e-use-python-kyabol', 'python', 'kyabol', 'USES', 'Built with', 80, 'verified', 'manual'),
('e-use-python-motion', 'python', 'motionx', 'USES', 'Built with', 85, 'verified', 'manual'),
('e-use-arduino-obstacle', 'arduino', 'obstacle-car', 'USES', 'Built with', 75, 'verified', 'manual'),
('e-use-arduino-line', 'arduino', 'line-robot', 'USES', 'Built with', 80, 'verified', 'manual'),
('e-use-cv-drish', 'computer-vision', 'drishtikon-yantra', 'USES', 'Core tech', 90, 'verified', 'manual'),
('e-use-cv-motion', 'computer-vision', 'motionx', 'USES', 'Core tech', 90, 'verified', 'manual'),
('e-use-tf-kyabol', 'tensorflow', 'kyabol', 'USES', 'AI framework', 70, 'verified', 'manual'),
('e-use-mp-motion', 'mediapipe', 'motionx', 'USES', 'Pose detection', 85, 'verified', 'manual');

-- ============================================
-- EDGES - Recognition/Support
-- ============================================
INSERT INTO universe_edges (id, source_id, target_id, type, label, weight, verification_status, source) VALUES
('e-sup-lion', 'lion-circuits', 'lakshveer', 'SUPPORTED_BY', 'Sponsor', 75, 'verified', 'manual'),
('e-sup-malpani', 'malpani-ventures', 'lakshveer', 'SUPPORTED_BY', 'Grant provider', 85, 'verified', 'manual'),
('e-sup-param', 'param-foundation', 'lakshveer', 'SUPPORTED_BY', 'Makeathon host', 70, 'verified', 'manual'),
('e-sup-residency', 'the-residency', 'lakshveer', 'SUPPORTED_BY', 'Accelerator', 75, 'verified', 'manual'),
('e-won-vedanta', 'lakshveer', 'vedanta-makeathon', 'WON_AT', 'Special Mention', 85, 'verified', 'manual'),
('e-won-hack2', 'lakshveer', 'hardware-hackathon-2', 'PRESENTED_AT', 'Top-5 Finalist', 80, 'verified', 'manual'),
('e-won-gemini', 'lakshveer', 'gemini-hackathon', 'PRESENTED_AT', 'Participated', 85, 'verified', 'manual'),
('e-won-grant', 'lakshveer', 'malpani-grant', 'WON_AT', 'Received', 90, 'verified', 'manual');
