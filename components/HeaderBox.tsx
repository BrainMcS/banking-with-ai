const HeaderBox = ({ type = "title", title, subtext, user }: HeaderBoxProps) => {
  return (
    <div className="header-box">
      <h1 className="header-box-title dark:text-white">
        {title}
        {type === 'greeting' && (
          <span className="text-bankGradient dark:text-blue-400">
            &nbsp;{user}
          </span>
        )}
      </h1>
      <p className="header-box-subtext dark:text-gray-400">{subtext}</p>
    </div>
  )
}

export default HeaderBox