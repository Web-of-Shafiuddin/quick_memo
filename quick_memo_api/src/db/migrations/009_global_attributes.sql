-- ----------------------------------------------------------------------
-- 9. GLOBAL ATTRIBUTE MANAGEMENT
-- ----------------------------------------------------------------------

-- Table for defining attribute keys (e.g., 'Size', 'Color', 'RAM')
CREATE TABLE IF NOT EXISTS attribute_definitions (
    attribute_def_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (name, user_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create trigger for attribute_definitions
CREATE TRIGGER set_attribute_definitions_timestamp
BEFORE UPDATE ON attribute_definitions
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Table for predefined attribute values (e.g., 'Small', 'Large', 'Red', 'Blue')
CREATE TABLE IF NOT EXISTS attribute_values (
    attribute_value_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    attribute_def_id INT NOT NULL,
    value VARCHAR(100) NOT NULL,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (value, attribute_def_id),
    FOREIGN KEY (attribute_def_id) REFERENCES attribute_definitions(attribute_def_id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create trigger for attribute_values
CREATE TRIGGER set_attribute_values_timestamp
BEFORE UPDATE ON attribute_values
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE INDEX IF NOT EXISTS attribute_values_def_id_idx ON attribute_values(attribute_def_id);
