# Function to execute command in another Bash session
execute_in_another_session() {
    # Execute the command in another Bash session and capture the output
    (eval unshare -U "$@"; echo "$BASHPID")
}

# Set up trap to execute execute_in_another_session function before every command
trap 'execute_in_another_session $BASH_COMMAND; return' DEBUG