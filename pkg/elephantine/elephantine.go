package elephantine

type Note struct {
	Type          string
	Id            string
	Title         string
	Content       string
	TaskAll       int64
	TaskCompleted int64
	Created       int64
	Updated       int64
	NotebookId    string
	Tags          []string
	IsFavorite    int64
	Trash         int64
	Files         []string
}
