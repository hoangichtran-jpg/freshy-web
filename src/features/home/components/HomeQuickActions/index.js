import PropTypes from "prop-types";

import { ArrowRightOutlined } from "@ant-design/icons";

function HomeQuickActions({ actions, onNavigate }) {
  return (
    <div className="home-quick-actions">
      {actions.map((action) => {
        const Icon = action.icon;

        return (
          <button
            key={action.key}
            type="button"
            className={[
              "home-quick-action",
              `home-quick-action--${action.tone || "neutral"}`,
            ].join(" ")}
            onClick={() => {
              onNavigate(action.path);
            }}
          >
            <span className="home-quick-action__icon">
              <Icon />
            </span>

            <span className="home-quick-action__content">
              <strong className="home-quick-action__title">
                {action.title}
              </strong>

              <span className="home-quick-action__description">
                {action.description}
              </span>
            </span>

            <ArrowRightOutlined className="home-quick-action__arrow" />
          </button>
        );
      })}
    </div>
  );
}

HomeQuickActions.propTypes = {
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      path: PropTypes.string.isRequired,
      icon: PropTypes.elementType.isRequired,
      tone: PropTypes.string,
    }),
  ).isRequired,

  onNavigate: PropTypes.func.isRequired,
};

export default HomeQuickActions;
